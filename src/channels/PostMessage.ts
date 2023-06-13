import { randomNonce, getTimestamp } from '../utilities/index.js';
import { Channel, ChannelFactory, DecryptedMessage, EncryptedMessage } from './Channel.js';

const CONFIRMATION_TIMEOUT = 10000;
const EVENTS = {
  CONNECTION_REQUEST: 'connection-request',
  CONNECT_CONFIRMATION: 'connection-confirmation',
  MESSAGE: 'message',
  MESSAGE_CONFIRMATION: 'message-confirmation',
  DISCONNECT: 'disconnect',
  DISCONNECT_CONFIRMATION: 'disconnect-confirmation',
}

export class PostMessageChannel extends Channel {
  protected disconnectConfirmationCallback: Function | undefined;
  protected messageConfirmationCallbacks: Map<string, Function> = new Map();
  protected eventCallbacks: Map<string, Function> = new Map();
  protected timeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(args) {
    super(args);
  }

  async send(data) {
    return new Promise(async (resolve, reject) => {
      const sender = this.spark.controller.identifier;
      const encrypted = await this.spark.cipher.encrypt({ data, sharedKey: this.sharedKey });
      const timestamp = getTimestamp();
      const messageId = randomNonce(16);
      const ciphertext = await this.spark.signer.sign({ data: { messageId, sender, encrypted, timestamp } });

      this.messageConfirmationCallbacks.set(messageId, (args) => {
        const { mid } = args;
        clearTimeout(this.timeouts.get(mid));
        this.timeouts.delete(mid);
        const { receipt } = args;
        resolve(receipt);
      })

      this.timeouts.set(messageId, setTimeout(() => {
        this.messageConfirmationCallbacks.delete(messageId);
        reject({ message: 'message sent but could not get receipt' });
      }, CONFIRMATION_TIMEOUT));

      this.target.source.postMessage({ cid: this.cid, type: EVENTS.MESSAGE, ciphertext }, this.target.origin);
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.disconnectConfirmationCallback = (args) => {
        clearTimeout(this.timeouts.get(this.cid));
        this.timeouts.delete(this.cid);
        const { receipt } = args;
        resolve(receipt);
      }

      this.timeouts.set(this.cid, setTimeout(() => {
        this.messageConfirmationCallbacks.clear();
        this.disconnectConfirmationCallback = undefined;
        reject({ message: 'channel closed but could not get confirmation' });
      }, CONFIRMATION_TIMEOUT));

      this.target.source.postMessage({ cid: this.cid, type: EVENTS.DISCONNECT }, this.target.origin);
    });
  }

  // this calls registered callbacks for confirmation events that we initiated
  confirm(args) {
    const { type, mid, ...data } = args;
    let callback: Function | undefined = undefined;
    if (type === EVENTS.DISCONNECT_CONFIRMATION) {
      callback = this.disconnectConfirmationCallback;
      clearTimeout(this.timeouts.get(this.cid));
    } else if (type === EVENTS.MESSAGE_CONFIRMATION) {
      callback = this.messageConfirmationCallbacks.get(mid);
      this.messageConfirmationCallbacks.delete(mid);
      clearTimeout(this.timeouts.get(mid));
      this.timeouts.delete(mid);
    }
    if (callback) callback(data);
  }

  // this calls registered callbacks for events that we received
  async callback(args) {
    const { type, ...data } = args;
    const isEvent = type === EVENTS.MESSAGE || type === EVENTS.DISCONNECT;
    const callback = this.eventCallbacks.get(type);
    if (isEvent && callback && type === EVENTS.MESSAGE) {
      const { ciphertext } = data;
      const opened = await this.spark.signer.verify({ signature: ciphertext, publicKey: this.target.publicKey });
      if (!opened) return; // if we can't open the signature fail quietly

      const { messageId: mid, sender, encrypted, timestamp } = opened;
      const decrypted = await this.spark.cipher.decrypt({ data: encrypted, sharedKey: this.sharedKey });
      const message = new DecryptedMessage({ cid: this.cid, mid, ciphertext, sender, content: decrypted, timestamp });
      callback(message);

      // send confirmation
      let receipt = await this.spark.cipher.encrypt({ data: { type: EVENTS.MESSAGE_CONFIRMATION, message }, sharedKey: this.sharedKey });
      receipt = await this.spark.signer.sign({ data: receipt });

      this.target.source.postMessage({ cid: this.cid, mid, type: EVENTS.MESSAGE_CONFIRMATION, receipt }, this.target.origin);
    } else if (isEvent && type === EVENTS.DISCONNECT && callback) {
      // clear all the callbacks
      this.eventCallbacks.clear();
      this.messageConfirmationCallbacks.clear();
      this.disconnectConfirmationCallback = undefined;
      clearTimeout(this.timeouts.get(this.cid))
      this.timeouts.clear();
      callback(data);

      // send confirmation
      let receipt = await this.spark.cipher.encrypt({ data: { type: EVENTS.DISCONNECT_CONFIRMATION, cid: this.cid }, sharedKey: this.sharedKey });
      receipt = await this.spark.signer.sign({ data: receipt });
      this.target.source.postMessage({ cid: this.cid, type: EVENTS.DISCONNECT_CONFIRMATION, receipt }, this.target.origin);
    }
  }

  on(event, callback) {
    if (event === EVENTS.MESSAGE || event === EVENTS.DISCONNECT) {
      this.eventCallbacks.set(event, callback);
    }
  }
}

export class PostMessage extends ChannelFactory {
  private channels: Map<string, PostMessageChannel> = new Map();
  private connectionConfirmationCallbacks: Map<string, Function> = new Map();
  private connectionRequestCallback: Function;
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(args) {
    super(args);

    const handleConnectionRequest = async (event) => {
      const { data, source } = event;
      const { origin, publicKeys, cid } = data;
      const callback = this.connectionRequestCallback;
      const sharedKey = await this.spark.cipher.sharedKey({ publicKey: publicKeys.encryption });
      if (!callback) return; // if no callback is registered, we're not listening for requests

      new Promise(async (resolve, reject) => {
        const isValid = cid && origin && sharedKey && callback;
        if (!isValid) reject({ message: 'connection failed' });

        const _resolve = () => {
          const channel = new PostMessageChannel({ spark: this.spark, cid, publicKey: publicKeys.signing, sharedKey, origin, source });
          this.channels.set(cid, channel);
          const type = EVENTS.CONNECT_CONFIRMATION;
          const options = { cid, type, origin: window.location.origin, publicKeys: this.spark.controller.publicKeys }
          source.postMessage(options, origin);
          clearTimeout(this.timeouts.get(cid));
          this.timeouts.delete(cid);
          resolve(void 0);
          return channel;
        }

        const _reject = () => reject({ message: 'connection denied' });
        callback({ cid, publicKeys, origin }, _resolve, _reject);
      })
    }

    const handleConnectionConfirmation = async (event) => {

      const { data, source } = event;
      const { origin, publicKeys, cid } = data;
      const callback = this.connectionConfirmationCallbacks.get(cid);
      if (!callback) return;
      callback({ cid, publicKeys, origin, source })
    }

    const handleMessage = async (event) => {
      const { data, } = event;
      const { ciphertext, cid } = data;
      const channel = this.channels.get(cid);
      const isSelf = channel?.target.publicKey === this.spark.controller.publicKeys.signing; // needed for node environment
      if (channel && !isSelf) channel.callback({ type: EVENTS.MESSAGE, ciphertext })
    }

    const handleMessageConfirmation = async (event) => {
      const { data, } = event;
      const { receipt, mid, cid } = data;
      const channel = this.channels.get(cid);
      const isSelf = channel?.target.publicKey === this.spark.controller.publicKeys.signing; // needed for node environment
      if (channel && !isSelf) channel.confirm({ type: EVENTS.MESSAGE_CONFIRMATION, mid, receipt });
    }

    const handleDisconnect = async (event) => {
      const { data, } = event;
      const { cid } = data;
      const channel = this.channels.get(cid);
      const isSelf = channel?.target.publicKey === this.spark.controller.publicKeys.signing; // needed for node environment
      if (channel && !isSelf) channel.callback({ type: EVENTS.DISCONNECT, ...data })
    }

    const handleDisconnectConfirmation = async (event) => {
      const { data, } = event;
      const { receipt, cid } = data;
      const channel = this.channels.get(cid);
      const isSelf = channel?.target.publicKey === this.spark.controller.publicKeys.signing; // needed for node environment
      if (channel && !isSelf) channel.confirm({ type: EVENTS.DISCONNECT_CONFIRMATION, receipt });
    }

    const handler = async (event) => {
      const { data: { type, cid }, source } = event;
      if (!source || !cid) return;
      const channel = this.channels.get(cid);
      if (type === EVENTS.CONNECTION_REQUEST && !channel) {               // inbound connection request we're receiving
        handleConnectionRequest(event);
      } else if (type === EVENTS.CONNECT_CONFIRMATION && !channel) {      // confirming an outbound request we initiated
        handleConnectionConfirmation(event);
      } else if (type === EVENTS.MESSAGE && channel) {                    // inbound message we're receiving
        handleMessage(event);
      } else if (type === EVENTS.MESSAGE_CONFIRMATION && channel) {       // confirming an outbound message we initiated
        handleMessageConfirmation(event);
      } else if (type === EVENTS.DISCONNECT && channel) {                 // inbound disconnect we're receiving
        handleDisconnect(event);
      } else if (type === EVENTS.DISCONNECT_CONFIRMATION && channel) {    // confirming an outbound disconnect we initiated
        handleDisconnectConfirmation(event);
      }
    };

    window.addEventListener('message', handler);
  }

  // request a connection to a remote window
  connect(url) {
    const targetOrigin = new URL(url).origin;
    const origin = window.location.origin;
    const publicKeys = this.spark.controller.publicKeys;
    const cid = randomNonce(16);
    const message = { type: EVENTS.CONNECTION_REQUEST, origin, publicKeys, cid };
    const source = window.open(targetOrigin);

    return new Promise((resolve, reject) => {
      if (!source) return reject({ message: 'connection failed' });

      this.connectionConfirmationCallbacks.set(cid, async (args) => {
        const { cid, publicKeys, origin, source } = args;
        const sharedKey = await this.spark.cipher.sharedKey({ publicKey: publicKeys.encryption });
        if (!sharedKey || !origin || !source || !cid) return reject({ message: 'connection failed' });
        const channel = new PostMessageChannel({ spark: this.spark, cid, publicKey: publicKeys.signing, sharedKey, origin, source });
        this.channels.set(cid, channel);
        clearTimeout(this.timeouts.get(cid));
        this.timeouts.delete(cid);
        resolve(channel);
      })

      this.timeouts.set(cid, setTimeout(() => {
        reject({ message: 'connection confirmation timeout' });
      }, CONFIRMATION_TIMEOUT));

      source.postMessage(message, targetOrigin);
    });
  }

  recieve(callback) {
    this.connectionRequestCallback = callback;
  }
}

/*
  CONNECTION FLOWS
  alice requests connection { cid, identifiers, publicKeys, origin, timestamp, signature } 

  bob computes shared key, signs timestamp and sends back { cid, identifiers, publicKeys, origin, timestamp, signature, receipt: { cid, timestamp, identifiers/publicSigningKeys }}
  
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

class TestChannel {
  send(data) { }
  close() { }
  onmessage() { }
  onclose() { }
}

// if the time the request hits receiver is greater deny connection
const CONNECTION_THRESHOLD = 10000;
const CONFIRMATION_TIMEOUT = 10000;
const CHANNEL_EVENT = {
  CONNECTION_REQUEST: 'connection-request',
  CONNECTION_CONFIRMATION: 'connection-confirmation',
  MESSAGE: 'message',
  MESSAGE_CONFIRMATION: 'message-confirmation',
  DISCONNECT: 'disconnect',
  DISCONNECT_CONFIRMATION: 'disconnect-confirmation',
}

class Test {
  // store messages that hit before handshake is complete
  private preConnectionMessageQueue: Map<string, any> = new Map();

  // promises are resolved with just receipts at initiators end
  private connectPromises: Map<string, Function> = new Map();
  private disconnectPromises: Map<string, Function> = new Map();
  private messagePromises: Map<string, Function> = new Map();

  // callbacks are triggered with payloads and receipts at receivers' end "onmessage, onconnect, ondisconnect, onerror"
  private connectCallbacks: Map<string, Function> = new Map();
  private disconnectCallbacks: Map<string, Function> = new Map();
  private messageCallbacks: Map<string, Function> = new Map();

  // timeouts
  private connectTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private disconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private messageTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // channels
  private channels: Map<string, PostMessageChannel> = new Map();

  constructor() {
    const handler = async (event) => {

    };

    window.addEventListener('message', handler);
  }

  connect() {

  }

  receive() {

  }
}
