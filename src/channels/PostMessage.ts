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
  protected confirmCallbacks: Map<string, Function> = new Map();
  protected timeouts: Map<string, NodeJS.Timeout> = new Map();
  protected callbacks: Map<string, Function> = new Map();

  constructor(args) {
    super(args);
  }

  async send(data) {
    return new Promise(async (resolve, reject) => {
      const sender = this.spark.controller.identifier;
      const encrypted = await this.spark.cipher.encrypt({ data, sharedKey: this.sharedKey });
      const ciphertext = await this.spark.signer.sign({ data: encrypted });
      const timestamp = getTimestamp();
      const message = new EncryptedMessage({ sender, ciphertext, timestamp });
      
      this.confirmCallbacks.set(message.mid, (args) => {
        const { mid } = args;
        clearTimeout(this.timeouts.get(mid));
        this.timeouts.delete(mid);
        resolve(void 0);
      })

      this.timeouts.set(message.mid, setTimeout(() => {
        this.confirmCallbacks.delete(message.mid);
        reject({ message: 'message confirmation timeout' });
      }, CONFIRMATION_TIMEOUT));

      this.target.source.postMessage({ cid: this.cid, type: EVENTS.MESSAGE, message }, this.target.origin);
    });
  }

  close() { }

  // todo - finish the confirmation and allow rejection from callbacks and confirms
  confirm(args) {
    const { type, mid, ...data } = args;
    const isEvent = type === EVENTS.MESSAGE_CONFIRMATION || type === EVENTS.DISCONNECT_CONFIRMATION;
    const confirm = this.confirmCallbacks.get(mid);
    if (isEvent && confirm && type === EVENTS.MESSAGE_CONFIRMATION) {
      console.log('confirming', !!confirm)
      const { mid } = args;
      if (this.confirmCallbacks.has(mid)) {
        const callback = this.confirmCallbacks.get(mid);
        if (callback) callback(args);
      }
    }
  }

  async callback(args) {
    const { type, ...data } = args;
    const isEvent = type === EVENTS.MESSAGE || type === EVENTS.DISCONNECT;
    const callback = this.callbacks.get(type);
    if (isEvent && callback && type === EVENTS.MESSAGE) {
      const { mid, sender, ciphertext, timestamp } = data;
      const opened = await this.spark.signer.verify({ signature: ciphertext, publicKey: this.target.publicKey });
      const decrypted = await this.spark.cipher.decrypt({ data: opened, sharedKey: this.sharedKey });
      const message = new DecryptedMessage({ cid: this.cid, mid, ciphertext, sender, content: decrypted, timestamp });
      callback(message);
      const encrypted = await this.spark.cipher.encrypt({ data: message, sharedKey: this.sharedKey });
      const receipt = await this.spark.signer.sign({ data: encrypted });
      this.target.source.postMessage({ cid: this.cid, mid, type: EVENTS.MESSAGE_CONFIRMATION, receipt }, this.target.origin);
    } else if (isEvent && callback && type === EVENTS.DISCONNECT) {

    }
  }

  on(event, callback) {
    if (event === EVENTS.MESSAGE || event === EVENTS.DISCONNECT) {
      this.callbacks.set(event, callback);
    }
  }
}



export class PostMessage extends ChannelFactory {
  private channels: Map<string, PostMessageChannel> = new Map();
  private confirmCallbacks: Map<string, Function> = new Map();
  private requestCallback: Function;
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(args) {
    super(args);

    const handleConnectionRequest = async (event) => {
      const { data, source } = event;
      const { origin, publicKeys, cid } = data;
      const callback = this.requestCallback;
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
      const callback = this.confirmCallbacks.get(cid);
      if (!callback) return;
      callback({ cid, publicKeys, origin, source })
    }

    const handleMessage = async (event) => {
      const { data, } = event;
      const { message, cid } = data;
      const { sender, } = message;
      const channel = this.channels.get(cid);
      const isSelf = this.spark.controller.identifier === sender; // needed for testing
      if (channel && !isSelf) channel.callback({ type: EVENTS.MESSAGE, ...message })      
    }

    const handleMessageConfirmation = async (event) => {
      const { data, } = event;
      const { receipt, mid, cid } = data;
      const channel = this.channels.get(cid);
      const isSelf = this.spark.controller.identifier === receipt.sender; // needed for testing
      if (channel && !isSelf) channel.confirm({ type: EVENTS.MESSAGE_CONFIRMATION, ...data });
    }

    const handler = async (event) => {
      const { data: { type, cid }, source } = event;
      if (!source || !cid) return;
      const channel = this.channels.get(cid);
      if (type === EVENTS.CONNECTION_REQUEST && !channel) {               // inbound request with receive callback in place
        handleConnectionRequest(event);
      } else if (type === EVENTS.CONNECT_CONFIRMATION && !channel) {      // confirming an outbound request we initiated
        handleConnectionConfirmation(event);
      } else if (type === EVENTS.MESSAGE && channel) {                    // inbound message -> we're the receiver
        handleMessage(event);
      } else if (type === EVENTS.MESSAGE_CONFIRMATION && channel) {       // confirming an outbound message we initiated
        handleMessageConfirmation(event);
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
      this.confirmCallbacks.set(cid, async (args) => {
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
    this.requestCallback = callback;
  }
}
