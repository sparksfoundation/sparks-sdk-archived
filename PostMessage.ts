import { getTimestamp, randomNonce } from "./src/utilities/index.js";
import { Channel, ChannelManager } from "./src/channels/Channel.js";
/*
  CONNECTION FLOWS
  alice requests connection { cid, identifier, publicKeys, origin, timestamp, signature } 

  bob computes shared key, signs timestamp and sends back receipt  along with request payload { cid, timestamp, identifiers/publicSigningKeys }
  
  alice sets up a connection and signs a receipt signature of encrypted { cid, timestamp, identifiers/publicSigningKeys }
  alice's promise resolves

  bob receives receipt and verifies signature, sets up connection
  bob's callback is called after receiving receipt
*/


/*
  MESSAGE FLOWS
  alice sends message signature(encrypted({ mid, cid, contents, timestamp })) -> non-repudation from signature & untampered w/encryption
  bob receives message, opens signature, decrypts sends receipt signature(encrypted(mid)) -> message id is enough as it's unknown without intact receipt of original message
  bob's callback is called

  alice receives receipt, opens signature, decrypts, verifies mid, confirms receipt
  alice's promise resolves
*/

/*
  DISCONNECT FLOWS
  alice sends disconnect signature(encrypted({ cid, timestamp })) -> non-repudation from signature & untampered w/encryption
  bob receives disconnect, opens signature, decrypts sends receipt signature(encrypted(cid)) -> cid is enough as it's unknown without intact receipt of original disconnect
  bob's callback is called

  alice receives receipt, opens signature, decrypts, verifies cid, confirms receipt
  alice's promise resolves
*/


export class PostMessageChannel extends Channel {
  constructor(args) {
    super(args);
  }

  send(data) { }
  close() { }
  onmessage() { }
  onclose() { }
}

enum TIMEOUTS {
  CONNECTION_REQUEST = 10000, // deny connections with timestamps older than this
  MESSAGE_RECEIPT = 10000,    // stop waiting for receipts after this
};

enum CHANNEL_EVENT {
  CONNECTION_REQUEST = 'connection-request',
  CONNECTION_CONFIRMATION = 'connection-confirmation',
  MESSAGE = 'message',
  MESSAGE_CONFIRMATION = 'message-confirmation',
  DISCONNECT = 'disconnect',
  DISCONNECT_CONFIRMATION = 'disconnect-confirmation',
};

type RequestConnectionProps = {
  cid: string,
  timestamp: number,
  identifier: string,
  publicKeys: {
    signing: string,
    encryption: string,
  },
  origin: string,
}

type RequestConnectionPropsPayload = {
  signature: string, // signature of RequestConnectionProps
  publicKey: string, // public key of signer
}

type ConnectionReceiptProps = {
  cid: string,
  timestamp: number,
  peers: [
    { identifier: string, publicKeys: { signing: string, encryption: string }, origin: string },
    { identifier: string, publicKeys: { signing: string, encryption: string }, origin: string },
  ]
}

type ConnectionReceiptPropsPayload = {
  type: CHANNEL_EVENT.CONNECTION_CONFIRMATION,
  receipt: string, // signature of encrypted ConnectionReceiptProps
}

type cid = string; // channel id
type mid = string; // message id

export class PostMessage extends ChannelManager {
  // store messages that hit before handshake is complete -> initiator resolves first
  private preConfirmationQueue: Map<cid, any> = new Map();

  // promises are resolved with just receipts at initiators end
  private connectPromises: Map<cid, { resolve: Function, reject: Function }> = new Map();
  private disconnectPromises: Map<cid, { resolve: Function, reject: Function }> = new Map();
  private messagePromises: Map<mid, { resolve: Function, reject: Function }> = new Map();

  // callbacks are triggered with payloads and receipts at receivers' end "onmessage, onconnect, ondisconnect, onerror"
  private recieveConnectionCallback: Function;
  private connectConfirmations: Map<string, Function> = new Map();
  private disconectConfirmations: Map<string, Function> = new Map();
  private messageConfirmations: Map<string, Function> = new Map();

  // timeouts
  private connectTimeouts: Map<cid, NodeJS.Timeout> = new Map();
  private disconnectTimeouts: Map<cid, NodeJS.Timeout> = new Map();
  private messageTimeouts: Map<mid, NodeJS.Timeout> = new Map();

  // channels
  private channels: Map<string, PostMessageChannel> = new Map();
  private window; 

  init(window) { // move this out of testing
    this.window = window;
    const handleConnectionRequest = async (event) => {
      const { origin } = event;
      const { signature, publicKey } = event.data;
      const props = await this.spark.signer.verify({ signature, publicKey }) as RequestConnectionProps;
      const { cid, timestamp, identifier, publicKeys } = props;
      const oldTimestamp = getTimestamp() - timestamp > TIMEOUTS.CONNECTION_REQUEST;
      const isSelf = identifier === this.spark.controller.identifier;
      const missingProps = !cid || !timestamp || !identifier || !publicKeys;
      const callback = this.recieveConnectionCallback;

      if (oldTimestamp || isSelf || missingProps || !callback) {
        return; // let the request timeout
      }

      if (this.recieveConnectionCallback) {
        // here we need to send the receipt and wait for callback
        new Promise(async (resolve, reject) => {
          const target = {
            identifier,
            publicKeys,
            origin,
          };

          const source = {
            identifier: this.spark.controller.identifier,
            publicKeys: this.spark.controller.publicKeys,
            origin: window.location.origin,
          };

          this.recieveConnectionCallback({
            cid,
            target,
            resolve: async () => {
              const receiptData = { cid, timestamp, peers: [source, target] } as ConnectionReceiptProps;
              const sharedKey = await this.spark.cipher.sharedKey({ publicKey: publicKeys.encryption });
              if (!sharedKey) return reject('failed to computer shared key');

              const encryptedReciept = await this.spark.cipher.encrypt({ data: receiptData, sharedKey });
              if (!encryptedReciept) return reject('failed to encrypt receipt')

              const receipt = await this.spark.signer.sign({ data: encryptedReciept });
              if (!receipt) return reject('failed to sign receipt');

              const type = CHANNEL_EVENT.CONNECTION_CONFIRMATION;
              event.source.postMessage({ type, cid, ...source, timestamp, receipt }, event.source.origin);

              return new Promise((_resolve, _reject) => {
                this.connectConfirmations.set(cid, async (receipt) => {
                  const opened = await this.spark.signer.verify({ signature: receipt, publicKey: publicKeys.signing });
                  if (!opened) return reject('failed to open receipt');
                  const decrypted = await this.spark.cipher.decrypt({ data: opened, sharedKey });
                  const channelProps = { spark: this.spark, cid, target, sharedKey };
                  const channel = new PostMessageChannel({ ...channelProps, receipt });
                  this.channels.set(cid, channel);
                  return _resolve(channel);
                });

                this.preConfirmationQueue.set(cid, []);
              });
            },
            reject: () => {
              reject(void 0)
              return `connection ${cid} rejected`;
            },
          });
        });
      }
    }

    const handleConnectionConfirmation = async (event) => {
      const { source, data } = event;
      const { cid, identifier, publicKeys, origin, receipt, timestamp } = data;
      const callback = this.connectConfirmations.get(cid);
      const promise = this.connectPromises.get(cid);
      if (callback && receipt) {
        return callback(receipt);
      } else if (promise) {
        const { resolve, reject } = promise;
        if (this.channels.has(cid)) {
          return reject({ cid, error: 'channel already exists' });
        }
        const wrongOrigin = origin !== event.source.origin;
        const oldTimestamp = getTimestamp() - timestamp > TIMEOUTS.MESSAGE_RECEIPT;
        const sharedKey = await this.spark.cipher.sharedKey({ publicKey: publicKeys.encryption });
        const missingProps = !cid || !identifier || !publicKeys || !origin || !receipt || !timestamp;
        if (wrongOrigin || oldTimestamp || missingProps) {
          return reject({ cid, error: 'invalid connection confirmation' });
        }

        const channeProps = { spark: this.spark, cid, target: { identifier, publicKeys, origin }, sharedKey };
        const channel = new PostMessageChannel({ ...channeProps });
        this.channels.set(cid, channel);

        // check receipt and resign for the other party
        const opened = await this.spark.signer.verify({ signature: receipt, publicKey: publicKeys.signing });
        const decrypted = await this.spark.cipher.decrypt({ data: opened, sharedKey: channel.sharedKey });
        const encrypted = await this.spark.cipher.encrypt({ data: decrypted, sharedKey: channel.sharedKey });
        const signed = await this.spark.signer.sign({ data: encrypted });
        const type = CHANNEL_EVENT.CONNECTION_CONFIRMATION;
        event.source.postMessage({ type, cid, identifier: this.spark.controller.identifier, receipt: signed }, event.source.origin);

        // resolve receipt
        resolve({ cid, channel, receipt });
      }
    }

    const handleMessage = (event) => { }
    const handleMessageConfirmation = (event) => { }
    const handleDisconnect = (event) => { }
    const handleDisconnectConfirmation = (event) => { }

    const handler = async (event) => {
      const { type } = event.data;
      if (type === CHANNEL_EVENT.CONNECTION_REQUEST) {
        handleConnectionRequest(event);
      } else if (type === CHANNEL_EVENT.CONNECTION_CONFIRMATION) {
        handleConnectionConfirmation(event);
      } else if (type === CHANNEL_EVENT.MESSAGE) {
        handleMessage(event);
      } else if (type === CHANNEL_EVENT.MESSAGE_CONFIRMATION) {
        handleMessageConfirmation(event);
      } else if (type === CHANNEL_EVENT.DISCONNECT) {
        handleDisconnect(event);
      } else if (type === CHANNEL_EVENT.DISCONNECT_CONFIRMATION) {
        handleDisconnectConfirmation(event);
      }
    };

    this.window.addEventListener('message', handler);
    this.window.addEventListener('beforeunload', () => {
      this.window.removeEventListener('message', handler);
    });
  }

  constructor(spark) {
    super(spark);
  }

  /**
   * 
   * @param url - the url of the window to connect to
   * @returns 
   */
  async connect(url) {
    return new Promise(async (resolve, reject) => {
      const options = {
        cid: randomNonce(16),
        timestamp: getTimestamp(),
        identifier: this.spark.controller.identifier,
        publicKeys: this.spark.controller.publicKeys,
        origin: this.window.location.origin,
      } as RequestConnectionProps;

      const source = this.window.open(url, '_blank');
      const origin = new URL(url).origin;
      if (!source) return reject('Failed to open window');

      const signature = await this.spark.signer.sign({ data: options })
      const payload = {
        signature,
        publicKey: this.spark.controller.signingKeys.publicKey,
      } as RequestConnectionPropsPayload;

      this.connectPromises.set(options.cid, {
        resolve: ({ cid, channel, receipt }) => {
          this.connectPromises.delete(cid);
          clearTimeout(this.connectTimeouts.get(cid));
          resolve({ channel, receipt });
        },
        reject: ({ cid, error }) => {
          this.connectPromises.delete(cid);
          clearTimeout(this.connectTimeouts.get(cid));
          reject(error);
        }
      });

      source.postMessage({
        type: CHANNEL_EVENT.CONNECTION_REQUEST,
        ...payload,
      }, origin);
    });
  }

  recieve(callback) {
    this.recieveConnectionCallback = callback;
  }
}
