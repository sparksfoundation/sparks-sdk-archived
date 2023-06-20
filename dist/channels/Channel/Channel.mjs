import { getTimestamp, randomNonce } from "../../utilities/index.mjs";
import {
  ChannelErrorCodes,
  ChannelEventTypes,
  ChannelActions,
  ChannelEventConfirmTypes
} from "./types.mjs";
const _Channel = class {
  constructor(args) {
    this._promiseHandlers = /* @__PURE__ */ new Map();
    this._preconnectQueue = [];
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    this.spark = args.spark;
    if (!this.spark)
      throw new Error("Channel: missing spark");
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
    if (!args.channelType)
      throw new Error("Channel: missing channelType");
    this.channelType = args.channelType;
    this.channelId = args.channelId;
    this.identifier = args.identifier;
    this.publicKeys = args.publicKeys;
    this.sharedKey = args.sharedKey;
    this.receipt = args.receipt;
    this.receiveMessage = this.receiveMessage.bind(this);
  }
  get publicSigningKey() {
    return this.publicKeys.signing;
  }
  get sharedEncryptionKey() {
    return this.sharedKey;
  }
  open(payload, action, attempts = 0) {
    return new Promise((resolve, reject) => {
      const request = () => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => open request\n");
        const event = {
          eventType: ChannelEventTypes.OPEN_REQUEST,
          eventId: randomNonce(16),
          channelId: randomNonce(16),
          timestamp: getTimestamp(),
          identifier: this.spark.identifier,
          publicKeys: this.spark.publicKeys
        };
        const timeout = setTimeout(() => {
          if (this._promiseHandlers.has(event.eventId)) {
            this._promiseHandlers.delete(event.eventId);
            if (attempts <= _Channel.OPEN_RETRIES) {
              return this.open(payload, action, attempts + 1);
            } else {
              const payload2 = {
                eventId: event.eventId,
                error: ChannelErrorCodes.TIMEOUT_ERROR,
                message: "Channel open request timed out"
              };
              error(payload2);
            }
          }
        }, _Channel.OPEN_TIMEOUT);
        this._promiseHandlers.set(event.eventId, {
          resolve: (args) => {
            clearTimeout(timeout);
            confirm(args);
          },
          reject: (args) => {
            clearTimeout(timeout);
            error(args);
          }
        });
        this.sendMessage(event);
      };
      const accept = async (args) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => open accept\n");
        const ourInfo = {
          identifier: this.spark.identifier,
          publicKeys: this.spark.publicKeys
        };
        const peerInfo = {
          identifier: args.identifier,
          publicKeys: args.publicKeys
        };
        const peers = [ourInfo, peerInfo];
        const receiptData = {
          channelType: this.channelType,
          channelId: args.channelId,
          timestamp: args.timestamp,
          peers
        };
        const sharedKey = await this.spark.computeSharedKey({ publicKey: args.publicKeys.encryption });
        const ciphertext = await this.spark.encrypt({ data: receiptData, sharedKey });
        const receipt = await this.spark.sign({ data: ciphertext });
        const event = {
          eventType: ChannelEventTypes.OPEN_ACCEPT,
          eventId: args.eventId,
          channelId: args.channelId,
          timestamp: getTimestamp(),
          receipt,
          ...ourInfo
        };
        this._promiseHandlers.set(args.eventId, {
          resolve: confirm,
          reject: error
        });
        this.sendMessage(event);
      };
      const confirm = async (args) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => open confirm\n");
        const peerInfo = {
          identifier: args.identifier,
          publicKeys: args.publicKeys
        };
        const sharedKey = await this.spark.computeSharedKey({ publicKey: args.publicKeys.encryption });
        const channelData = {
          channelId: args.channelId,
          timestamp: args.timestamp,
          sharedKey,
          receipt: args.receipt,
          ...peerInfo
        };
        const openedReceipt = await this.spark.verify({ signature: args.receipt, publicKey: args.publicKeys.signing });
        const decrypted = await this.spark.decrypt({ data: openedReceipt, sharedKey });
        if (!decrypted || !decrypted.channelId || decrypted.channelId !== args.channelId) {
          return error({
            error: ChannelErrorCodes.OPEN_CONFIRM_ERROR,
            eventId: args.eventId,
            message: "failed to open and decrypt receipt"
          });
        }
        const encrypted = await this.spark.encrypt({ data: decrypted, sharedKey });
        const receipt = await this.spark.sign({ data: encrypted });
        const ourInfo = {
          identifier: this.spark.identifier,
          publicKeys: this.spark.publicKeys
        };
        const event = {
          eventType: ChannelEventTypes.OPEN_CONFIRM,
          eventId: args.eventId,
          channelId: args.channelId,
          timestamp: args.timestamp,
          receipt,
          ...ourInfo
        };
        this.sendMessage(event);
        complete(channelData);
      };
      const complete = (args) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => open complete\n");
        Object.keys(args).forEach((key) => {
          this[key] = args[key];
        });
        if (this._preconnectQueue.length) {
          this._preconnectQueue.forEach((event) => {
            this.send(event, ChannelActions.CONFIRM);
          });
          this._preconnectQueue = [];
        }
        if (this.onopen)
          this.onopen(this);
        return resolve(this);
      };
      const deny = (args) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => open deny\n");
        const event = {
          error: ChannelErrorCodes.OPEN_ACCEPT_ERROR,
          eventId: args.eventId,
          message: `open request denied${args.message ? ": " + args.message : ""}`
        };
        this._promiseHandlers.set(event.eventId, {
          resolve: error,
          reject: error
        });
        this.sendMessage(event);
      };
      const error = (args) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => open error\n");
        if (this.onerror)
          this.onerror(args);
        this._promiseHandlers.delete(args.eventId);
        resolve(args);
      };
      if (action === ChannelActions.ACCEPT)
        accept(payload);
      else if (action === ChannelActions.REJECT)
        deny(payload);
      else
        request();
    });
  }
  send(payload, action, attempts = 0) {
    return new Promise((resolve, reject) => {
      const send = async (data) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => send msg request\n");
        const encrypted = await this.spark.encrypt({ data, sharedKey: this.sharedKey });
        const message = await this.spark.sign({ data: encrypted });
        const eventId = randomNonce(16);
        const messageId = randomNonce(16);
        const event = {
          eventType: ChannelEventTypes.MESSAGE_SEND,
          eventId,
          messageId,
          channelId: this.channelId,
          timestamp: getTimestamp(),
          message
        };
        const timeout = setTimeout(() => {
          if (this._promiseHandlers.has(event.eventId)) {
            this._promiseHandlers.delete(event.eventId);
            if (attempts <= _Channel.MESSAGE_RETRIES) {
              return this.send(payload, action, attempts + 1);
            } else {
              const payload2 = {
                error: ChannelErrorCodes.TIMEOUT_ERROR,
                eventId: event.eventId,
                message: "message send timed out"
              };
              return error(payload2);
            }
          }
        }, _Channel.MESSAGE_TIMEOUT);
        this._promiseHandlers.set(eventId, {
          resolve: (args) => {
            clearTimeout(timeout);
            receipt(args);
          },
          reject: (args) => {
            clearTimeout(timeout);
            error(args);
          }
        });
        this.sendMessage(event);
      };
      const confirm = async (payload2) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => send msg confirm\n");
        const opened = await this.spark.verify({ signature: payload2.message, publicKey: this.publicKeys.signing });
        const message = await this.spark.decrypt({ data: opened, sharedKey: this.sharedKey });
        if (!message) {
          return error({
            error: ChannelErrorCodes.MESSAGE_CONFIRM_ERROR,
            eventId: payload2.eventId,
            message: "failed to decrypt message"
          });
        }
        const receiptData = {
          messageId: payload2.messageId,
          timestamp: payload2.timestamp,
          message
        };
        const encrypted = await this.spark.encrypt({ data: receiptData, sharedKey: this.sharedKey });
        const receipt2 = await this.spark.sign({ data: encrypted });
        const event = {
          eventType: ChannelEventTypes.MESSAGE_CONFIRM,
          eventId: payload2.eventId,
          messageId: payload2.messageId,
          channelId: this.channelId,
          timestamp: getTimestamp(),
          receipt: receipt2
        };
        this.sendMessage(event);
        complete(receiptData);
      };
      const receipt = (payload2) => {
        if (!payload2.receipt) {
          return error({
            error: ChannelErrorCodes.MESSAGE_CONFIRM_ERROR,
            eventId: payload2.eventId,
            message: "failed to get receipt"
          });
        }
        if (this.onmessage)
          this.onmessage(payload2.receipt);
        return resolve(payload2.receipt);
      };
      const complete = (payload2) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => send msg complete\n");
        if (this.onmessage)
          this.onmessage(payload2);
        return resolve(payload2);
      };
      const error = (payload2) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => send msg error\n");
        if (this.onerror)
          this.onerror(payload2);
        this._promiseHandlers.delete(payload2.eventId);
        return reject(payload2);
      };
      if (action === "confirm")
        confirm(payload);
      else
        send(payload);
    });
  }
  close(payload, action) {
    return new Promise((resolve, reject) => {
      const eventId = randomNonce(16);
      const close = () => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => close request\n");
        const event = {
          eventType: ChannelEventTypes.CLOSE_REQUEST,
          eventId,
          channelId: this.channelId,
          timestamp: getTimestamp()
        };
        const timeout = setTimeout(() => {
          if (this._promiseHandlers.has(event.eventId)) {
            this._promiseHandlers.delete(event.eventId);
            const payload2 = {
              error: ChannelErrorCodes.CLOSE_CONFIRM_ERROR,
              eventId: event.eventId,
              message: "close request timed out, could not get receipt"
            };
            return error(payload2);
          }
        }, _Channel.CLOSE_TIMEOUT);
        this._promiseHandlers.set(eventId, {
          resolve: (args) => {
            clearTimeout(timeout);
            receipt(args);
          },
          reject: (args) => {
            clearTimeout(timeout);
            error(args);
          }
        });
        this.sendMessage(event);
      };
      const confirm = async (payload2) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => close confirm\n");
        const ourInfo = {
          identifier: this.spark.identifier,
          publicKeys: this.spark.publicKeys
        };
        const theirInfo = {
          identifier: this.identifier,
          publicKeys: this.publicKeys
        };
        const receiptData = {
          channelType: this.channelType,
          timestamp: payload2.timestamp,
          channelId: payload2.channelId,
          peers: [ourInfo, theirInfo]
        };
        const encrypted = await this.spark.encrypt({ data: receiptData, sharedKey: this.sharedKey });
        const receipt2 = await this.spark.sign({ data: encrypted });
        const event = {
          eventType: ChannelEventTypes.CLOSE_CONFIRM,
          eventId: payload2.eventId,
          channelId: this.channelId,
          timestamp: getTimestamp(),
          receipt: receipt2
        };
        this.sendMessage(event);
        complete(event);
      };
      const receipt = (payload2) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => close receipt\n");
        if (this.onclose)
          this.onclose(payload2.receipt);
        return resolve(payload2.receipt);
      };
      const complete = (payload2) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => close complete\n");
        if (this.onclose)
          this.onclose(payload2.receipt);
        return resolve(payload2.receipt);
      };
      const error = (payload2) => {
        console.log(this.spark.signingKeys.publicKey.slice(0, 4) + " => close error\n");
        if (this.onerror)
          this.onerror(payload2);
        this._promiseHandlers.delete(payload2.eventId);
        return reject(payload2);
      };
      if (action === ChannelActions.CONFIRM)
        confirm(payload);
      else
        close();
    });
  }
  sendMessage(event) {
    throw new Error("sendMessage not implemented");
  }
  receiveMessage(payload) {
    const { eventType, eventId, messageId } = payload;
    if (!eventType || !eventId)
      return;
    const isEvent = Object.values(ChannelEventTypes).includes(eventType);
    const isError = Object.values(ChannelErrorCodes).includes(eventType);
    const isMessage = eventType === ChannelEventTypes.MESSAGE_SEND;
    const needsConfirm = Object.values(ChannelEventConfirmTypes).includes(eventType);
    if (isError) {
      const handler = this._promiseHandlers.get(eventId);
      this._promiseHandlers.delete(eventId);
      if (handler)
        handler.reject(payload);
    }
    if (isMessage && !this.identifier) {
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
      if (handler)
        handler.resolve(payload);
    }
  }
  static receive(callback, options) {
    throw new Error("receive not implemented");
  }
  static channelRequest({ payload, Channel: Channel2, options }) {
    const { eventType, channelId } = payload;
    const isRequest = eventType === ChannelEventTypes.OPEN_REQUEST;
    const hasId = channelId;
    const denied = [];
    if (!isRequest || !hasId)
      return null;
    let channel = new Channel2({
      channelId,
      ...options
    });
    let resolve = async () => {
      if (denied.includes(channelId)) {
        throw new Error("trying to resolve a rejected channel");
      } else {
        return await channel.open(payload, ChannelActions.ACCEPT);
      }
    };
    const reject = (message) => {
      denied.push(channelId);
      channel.open({ ...payload, message }, ChannelActions.REJECT);
    };
    const details = payload;
    return { resolve, reject, details };
  }
};
export let Channel = _Channel;
Channel.OPEN_RETRIES = 3;
Channel.OPEN_TIMEOUT = 1e4;
Channel.MESSAGE_RETRIES = 3;
Channel.MESSAGE_TIMEOUT = 1e4;
Channel.CLOSE_TIMEOUT = 1e4;
