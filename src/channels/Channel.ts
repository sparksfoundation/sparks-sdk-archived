import { getTimestamp, randomNonce } from "../utilities/index.js";
import { 
  ChannelError, ChannelErrorCodes, ChannelEventId, 
  ChannelEventTypes, ChannelMessage, ChannelPeer, ChannelPeers, ChannelPromiseHandler, 
  ChannelReceipt, ChannelTypes, ChannelRequestEvent, ChannelAcceptEvent, ChannelConfirmEvent, 
  ChannelCompleteOpenData, ChannelActions, ChannelMessageEvent, ChannelMessageReceiptData, 
  ChannelMessageConfirmEvent, ChannelCloseEvent, ChannelCloseConfirmationEvent, 
  ChannelClosedReceiptData, ChannelClosedReceipt, ChannelReceiptData, ChannelEventConfirmTypes 
} from "./types.js";
import { Spark } from "../Spark.js";
import { Identifier, PublicKeys } from "../controllers/types.js";
import { SharedEncryptionKey } from "../ciphers/types.js";

export class Channel {
  protected spark: Spark;
  protected channelType: ChannelTypes;
  protected channelId: ChannelEventId;
  protected identifier: Identifier;
  protected publicKeys: PublicKeys;
  protected sharedKey: SharedEncryptionKey;
  protected receipt: ChannelReceipt;

  protected _promiseHandlers = new Map<string, ChannelPromiseHandler>();
  protected _preconnectQueue: ChannelMessageEvent[] = [];

  public onopen: ((error: Channel) => void) | null = null;
  public onclose: ((error: ChannelClosedReceipt) => void) | null = null;
  public onmessage: ((payload: ChannelMessage) => void) | null = null;
  public onerror: ((error: ChannelError) => void) | null = null;

  constructor(args) {
    this.spark = args.spark;
    Object.defineProperties(this, {
      spark: { enumerable: false, writable: false, },
    });

    if (!args.channelType) {
      throw new Error('Channel: missing channelType');
    }

    this.channelType = args.channelType;
    this.channelId = args.channelId;
    this.identifier = args.identifier;
    this.publicKeys = args.publicKeys;
    this.sharedKey = args.sharedKey;
    this.receipt = args.receipt;
    this.recieveMessage = this.recieveMessage.bind(this);
  }

  public open(payload, action): Promise<Channel|ChannelError> {
    return new Promise<Channel|ChannelError>((resolve, reject) => {
      // initiator:request sends channelId and info
      // reciever:accepts triggers via resolve -> sends info and receipt
      // initiator:confirm sends receipt and completes with channel
      // reciever:complete with channel
      const request = () => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => open request\n')

        const event: ChannelRequestEvent = {
          eventType: ChannelEventTypes.OPEN_REQUEST,
          eventId: randomNonce(16),
          channelId: randomNonce(16),
          timestamp: getTimestamp(),
          identifier: this.spark.controller.identifier,
          publicKeys: this.spark.controller.publicKeys,
        };

        this._promiseHandlers.set(event.eventId, {
          resolve: confirm,
          reject: error,
        });

        this.sendMessage(event);
      }

      const accept = async (args: ChannelRequestEvent) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => open accept\n')

        const ourInfo: ChannelPeer = {
          identifier: this.spark.controller.identifier,
          publicKeys: this.spark.controller.publicKeys,
        }

        const peerInfo: ChannelPeer = {
          identifier: args.identifier,
          publicKeys: args.publicKeys,
        }

        const peers: ChannelPeers = [ourInfo, peerInfo];

        const receiptData: ChannelReceiptData = {
          channelType: this.channelType,
          channelId: args.channelId,
          timestamp: args.timestamp,
          peers: peers,
        }

        const sharedKey = await this.spark.cipher.sharedKey({ publicKey: args.publicKeys.encryption });
        const ciphertext = await this.spark.cipher.encrypt({ data: receiptData, sharedKey });
        const receipt = await this.spark.signer.sign({ data: ciphertext });

        const event: ChannelAcceptEvent = {
          eventType: ChannelEventTypes.OPEN_ACCEPT,
          eventId: args.eventId,
          channelId: args.channelId,
          timestamp: getTimestamp(),
          receipt,
          ...ourInfo,
        };

        this._promiseHandlers.set(args.eventId, {
          resolve: confirm,
          reject: error,
        });

        this.sendMessage(event);
      }

      const confirm = async (args: ChannelAcceptEvent) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => open confirm\n')

        const peerInfo: ChannelPeer = {
          identifier: args.identifier,
          publicKeys: args.publicKeys,
        }

        const sharedKey = await this.spark.cipher.sharedKey({ publicKey: args.publicKeys.encryption });

        const channelData: ChannelCompleteOpenData = {
          channelId: args.channelId,
          timestamp: args.timestamp,
          sharedKey,
          receipt: args.receipt,
          ...peerInfo,
        };

        // verify receipt - resign and return
        const openedReceipt = await this.spark.signer.verify({ signature: args.receipt, publicKey: args.publicKeys.signing });
        const decrypted = await this.spark.cipher.decrypt({ data: openedReceipt, sharedKey });

        if (!decrypted || !decrypted.channelId || decrypted.channelId !== args.channelId) {
          return error({
            error: ChannelErrorCodes.OPEN_CONFIRM_ERROR,
            eventId: args.eventId,
            message: 'failed to open and decrypt receipt'
          } as ChannelError)
        }

        const encrypted = await this.spark.cipher.encrypt({ data: decrypted, sharedKey });
        const receipt = await this.spark.signer.sign({ data: encrypted });

        const ourInfo: ChannelPeer = {
          identifier: this.spark.controller.identifier,
          publicKeys: this.spark.controller.publicKeys,
        }

        const event: ChannelConfirmEvent = {
          eventType: ChannelEventTypes.OPEN_CONFIRM,
          eventId: args.eventId,
          channelId: args.channelId,
          timestamp: args.timestamp,
          receipt,
          ...ourInfo,
        };

        this.sendMessage(event);
        complete(channelData);
      }

      const complete = (args: ChannelCompleteOpenData) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => open complete\n')

        Object.keys(args).forEach(key => {
          this[key] = args[key];
        });

        if (this._preconnectQueue.length) {
          this._preconnectQueue.forEach(event => {
            this.send(event, ChannelActions.CONFIRM);
          });
          this._preconnectQueue = [];
        }

        if (this.onopen) this.onopen(this);
        return resolve(this);
      }

      const deny = (args) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => open deny\n')

        const event: ChannelError = {
          error: ChannelErrorCodes.OPEN_ACCEPT_ERROR,
          eventId: args.eventId,
          message: `open request denied${args.message ? ': ' + args.message : ''}`
        };

        this._promiseHandlers.set(event.eventId, {
          resolve: error,
          reject: error,
        });

        this.sendMessage(event);
      }

      const error = (args: ChannelError) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => open error\n')
        if (this.onerror) this.onerror(args);
        this._promiseHandlers.delete(args.eventId);
        resolve(args);
      }

      if (action === ChannelActions.ACCEPT) accept(payload);
      else if (action === ChannelActions.REJECT) deny(payload);
      else request();
    });
  }

  public send(payload, action) {
    // initiator:request
    // reciever:confirm (with receipt)
    // reciever:complete (with own receipt)
    // initiator:complete (with receipt)
    return new Promise((resolve, reject) => {

      const send = async (data: ChannelMessage) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => send msg request\n')

        const encrypted = await this.spark.cipher.encrypt({ data, sharedKey: this.sharedKey });
        const message = await this.spark.signer.sign({ data: encrypted });
        const eventId = randomNonce(16);
        const messageId = randomNonce(16);

        const event: ChannelMessageEvent = {
          eventType: ChannelEventTypes.MESSAGE_SEND,
          eventId,
          messageId,
          channelId: this.channelId,
          timestamp: getTimestamp(),
          message,
        };

        this._promiseHandlers.set(eventId, {
          resolve: receipt,
          reject: error,
        });

        this.sendMessage(event);
      }

      const confirm = async (payload: ChannelMessageEvent) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => send msg confirm\n')

        // decrypt message then make a receipt
        const opened = await this.spark.signer.verify({ signature: payload.message, publicKey: this.publicKeys.signing });
        const message = await this.spark.cipher.decrypt({ data: opened, sharedKey: this.sharedKey });

        if (!message) {
          return error({
            error: ChannelErrorCodes.MESSAGE_CONFIRM_ERROR,
            eventId: payload.eventId,
            message: 'failed to decrypt message'
          } as ChannelError)
        }

        const receiptData: ChannelMessageReceiptData = {
          messageId: payload.messageId,
          timestamp: payload.timestamp,
          message,
        };
        
        const encrypted = await this.spark.cipher.encrypt({ data: receiptData, sharedKey: this.sharedKey });
        const receipt = await this.spark.signer.sign({ data: encrypted });

        const event: ChannelMessageConfirmEvent = {
          eventType: ChannelEventTypes.MESSAGE_CONFIRM,
          eventId: payload.eventId,
          messageId: payload.messageId,
          channelId: this.channelId,
          timestamp: getTimestamp(),
          receipt,
        };

        this.sendMessage(event);
        complete(receiptData);
      }

      const receipt = (payload: ChannelMessageConfirmEvent) => {
        if (!payload.receipt) {
          return error({
            error: ChannelErrorCodes.MESSAGE_CONFIRM_ERROR,
            eventId: payload.eventId,
            message: 'failed to get receipt',
          } as ChannelError)
        }
        if (this.onmessage) this.onmessage(payload.receipt);
        return resolve(payload.receipt);
      }

      const complete = (payload: ChannelMessageReceiptData) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => send msg complete\n')

        if (this.onmessage) this.onmessage(payload);
        return resolve(payload);
      }

      const error = (payload: ChannelError) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => send msg error\n')
        if (this.onerror) this.onerror(payload);
        this._promiseHandlers.delete(payload.eventId);
        return reject(payload);
      }

      if (action === 'confirm') confirm(payload);
      else send(payload);
    });
  }

  public close(payload, action) {
    // initiator:request (with receipt)
    // reciever:confirm (with receipt)
    // reciever:complete (with own receipt)
    // initiator:complete (with receipt)
    return new Promise((resolve, reject) => {
      const eventId = randomNonce(16);

      const close = () => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => close request\n')

        const event: ChannelCloseEvent = {
          eventType: ChannelEventTypes.CLOSE_REQUEST,
          eventId,
          channelId: this.channelId,
          timestamp: getTimestamp(),
        };

        this._promiseHandlers.set(eventId, {
          resolve: receipt,
          reject: error,
        });

        this.sendMessage(event);
      }

      const confirm = async (payload: ChannelCloseEvent) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => close confirm\n')

        const ourInfo: ChannelPeer = {
          identifier: this.spark.controller.identifier,
          publicKeys: this.spark.controller.publicKeys,
        };

        const theirInfo: ChannelPeer = {
          identifier: this.identifier,
          publicKeys: this.publicKeys,
        };

        const receiptData: ChannelClosedReceiptData = {
          channelType: this.channelType,
          timestamp: payload.timestamp,
          channelId: payload.channelId,
          peers: [ourInfo, theirInfo],
        }

        const encrypted = await this.spark.cipher.encrypt({ data: receiptData, sharedKey: this.sharedKey });
        const receipt = await this.spark.signer.sign({ data: encrypted });

        const event: ChannelCloseConfirmationEvent = {
          eventType: ChannelEventTypes.CLOSE_CONFIRM,
          eventId: payload.eventId,
          channelId: this.channelId,
          timestamp: getTimestamp(),
          receipt
        };

        this.sendMessage(event);
        complete(event);
      }

      const receipt = (payload: ChannelCloseConfirmationEvent) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => close receipt\n')
        if (this.onclose) this.onclose(payload.receipt);
        return resolve(payload.receipt);
      }

      const complete = (payload: ChannelCloseConfirmationEvent) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => close complete\n')
        if (this.onclose) this.onclose(payload.receipt);
        return resolve(payload.receipt);
      }

      const error = (payload) => {
        console.log(this.spark.controller.signingKeys.publicKey.slice(0, 4) + ' => close error\n')
        if (this.onerror) this.onerror(payload);
        this._promiseHandlers.delete(payload.eventId);
        return reject(payload);
      }

      if (action === ChannelActions.CONFIRM) confirm(payload);
      else close();
    });
  }

  protected sendMessage(event: any) {
    throw new Error('sendMessage not implemented');
  }

  protected recieveMessage(payload: any) {
    const { eventType, eventId, messageId } = payload;
    if (!eventType || !eventId) return;

    const isEvent = Object.values(ChannelEventTypes).includes(eventType);
    const isError = Object.values(ChannelErrorCodes).includes(eventType);
    const isMessage = eventType === ChannelEventTypes.MESSAGE_SEND;
    const needsConfirm = Object.values(ChannelEventConfirmTypes).includes(eventType);
    
    if (isError) {
      const handler = this._promiseHandlers.get(eventId);
      this._promiseHandlers.delete(eventId);
      if (handler) handler.reject(payload);
    } if (isMessage && !this.identifier) {
      this._preconnectQueue.push(payload);
    } else if (needsConfirm) {
      if (eventType === ChannelEventTypes.CLOSE_REQUEST) {
        this.close(payload, ChannelActions.CONFIRM);
      } else if (eventType === ChannelEventTypes.MESSAGE_SEND) {
        this.send(payload, ChannelActions.CONFIRM);
      }
    } else if (isEvent) {
      const handler = this._promiseHandlers.get(eventId);
      this._promiseHandlers.delete(eventId);
      if (handler) handler.resolve(payload);
    }
  }

  static receive(callback: any, options: any) {
    throw new Error('receive not implemented');
  }

  static channelRequest({ payload, channel: Channel, options }) {
    const { eventType, channelId } = payload;
    const isRequest = eventType === ChannelEventTypes.OPEN_REQUEST;
    const hasId = channelId;
    const denied: string[] = [];

    if (!isRequest || !hasId) return null;

    let channel = new Channel({
      channelId,
      ...options,
    });

    let resolve = async (args) => {
      if (denied.includes(channelId)) {
        throw new Error('trying to resolve a rejected channel');
      } else {
        return await channel.open(payload, ChannelActions.ACCEPT);
      }
    }

    const reject = (message) => {
      denied.push(channelId);
      channel.open({ ...payload, message }, ChannelActions.REJECT);
    }

    const details = payload;

    return { resolve, reject, details };
  }
}