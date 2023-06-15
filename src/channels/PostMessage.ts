
import { getTimestamp, randomNonce } from '../utilities/index.js';
import { Channel } from './Channel.js';

export enum CHANNEL_EVENTS {
  REQUEST_CONNECTION = 'REQUEST_CONNECTION',
  CONRIM_CONNECTION = 'CONRIM_CONNECTION',
  MESSAGE = 'MESSAGE',
  MESSAGE_CONFIRMATION = 'MESSAGE_CONFIRMATION',
  CONNECTION_CLOSED = 'CONNECTION_CLOSED',
  CLOSED_CONFIRMATION = 'CLOSED_CONFIRMATION',
}

export enum POSTMESSAGE_ERRORS {
  PUBLIC_ENCRYPTION_KEY_ERROR = 'PUBLIC_ENCRYPTION_KEY_ERROR',
  CONNECT_REQUEST_OPTION_ERROR = 'CONNECT_REQUEST_OPTION_ERROR',
  CONFIRM_CONNECTION_ERROR = 'CONFIRM_CONNECTION_ERROR',
  CONNECTION_REJECTED_ERROR = 'CONNECTION_REJECTED_ERROR',
  INVALID_MESSAGE_RECEIPT_ERROR = 'INVALID_MESSAGE_RECEIPT_ERROR',
  INVALID_MESSAGE_ERROR = 'INVALID_MESSAGE_ERROR',
  CHANNEL_CLOSED_ERROR = 'CHANNEL_CLOSED_ERROR',
  INVALID_CLOSED_RECEIPT_ERROR = 'INVALID_CLOSED_RECEIPT_ERROR',
}

export type ConnectionRequestOptions = {
  cid: string;
  timestamp: number;
  identifier: string;
  publicKeys: {
    signing: string;
    encryption: string;
  };
}

export type ChannelErrorPayload = {
  cid: string;
  error: POSTMESSAGE_ERRORS;
  message: string;
}

export type MessageErrorPayload = {
  mid: string;
  error: POSTMESSAGE_ERRORS;
  message: string;
}

export type ChannelArgs = {
  _window?: Window;
  spark: any;
  cid: string;
  origin: string;
  source: Window;
  timestamp: number;
  identifier: string;
  sharedKey: string;
  publicKey: string;
  receipt: string;
}

export type OpenChannelArgs = {
  url: string;
}

export type ChannelRecieptData = {
  cid: string;
  timestamp: number;
  peers: {
    identifier: string;
    publicKeys: {
      signing: string;
      encryption: string;
    };
  }[];
}

export type ChannelReceipt = string;
export type ChannelConfirmWithReceiptPayload = ConnectionRequestOptions & {
  receipt: ChannelReceipt;
  type: CHANNEL_EVENTS.CONRIM_CONNECTION;
};

export type MessageData = {
  cid: string;
  mid: string;
  timestamp: number;
  content: string | object;
}

export type MessagePayload = {
  mid: string;                        // message id
  type: CHANNEL_EVENTS.MESSAGE;       // message type
  message: string;                    // encrypted then signed message
}

export type MessageCallbackData = MessageData & {
  receipt: MessageReceipt;
}

export type MessageEvent = {
  data: MessagePayload;
  origin: string;
  source: Window;
}

export type MessageReceipt = string; // encrypted then signed message data

export type ClosedData = {
  cid: string;
  timestamp: number;
}

export type ClosedReceipt = string; // encrypted then signed closed data

export type ClosedPayload = {
  cid: string;
  type: CHANNEL_EVENTS.CONNECTION_CLOSED;
  receipt: ClosedReceipt;
}

export type MessageReceiptPayload = {
  type: CHANNEL_EVENTS.MESSAGE_CONFIRMATION;
  mid: string;                        // message id
  receipt: string;                    // signed receipt
}

export class PostMessage extends Channel {
  private onclose: (closed: ClosedReceipt) => void;
  private onmessage: (message: MessageCallbackData) => void;
  private onerror: (error: ChannelErrorPayload | MessageErrorPayload) => void;
  private _window: Window;
  private _connectionPromises = new Map<string, { resolve: (args: Channel) => void, reject: (error: ChannelErrorPayload) => void }>();
  private _messagePromises = new Map<string, { resolve: (args: MessageReceipt) => void, reject: (error: MessageErrorPayload) => void }>();
  private _closePromises = new Map<string, { resolve: (args: ClosedReceipt) => void, reject: (error: ChannelErrorPayload) => void }>();

  private cid: string;
  private origin: string;
  private source: Window;
  private timestamp: number;
  private identifier: string;
  private sharedKey: string;
  private publicKey: string;
  private receipt: string;

  constructor(args: ChannelArgs) {
    const { _window, spark, origin, cid, source, identifier, timestamp, sharedKey, publicKey, receipt }: ChannelArgs = args;

    super(spark);

    const allProps = !!(cid && origin && source && identifier && timestamp && sharedKey && publicKey && receipt);
    const noProps = !(cid || origin || source || identifier || timestamp || sharedKey || publicKey || receipt);
    const validChannel = (allProps && !noProps) || (!allProps && noProps);
    if (!validChannel) {
      throw new Error('Invalid args: if youre initiating provide only "spark", if recieving use the PostMessage.receive function.');
    }

    this._window = _window || window;
    this.cid = cid;
    this.origin = origin;
    this.source = source;
    this.timestamp = timestamp;
    this.identifier = identifier;
    this.sharedKey = sharedKey;
    this.publicKey = publicKey;
    this.receipt = receipt;

    this._handler = this._handler.bind(this);
    this._handleConnectionConfirmation = this._handleConnectionConfirmation.bind(this);
    this._handleError = this._handleError.bind(this);
    this._handleMessageConfirmation = this._handleMessageConfirmation.bind(this);
    this._handleMessage = this._handleMessage.bind(this);
    this._handleClosed = this._handleClosed.bind(this);

    this._window.addEventListener('message', this._handler);
    this._window.addEventListener('beforeunload', this.close);
  }

  private async _handleConnectionConfirmation(event) {
    const { source, data, origin } = event;
    const { cid, timestamp, identifier, publicKeys, receipt }: ChannelConfirmWithReceiptPayload = data;

    const sharedKey = await this.spark.cipher.sharedKey({ publicKey: publicKeys.encryption });
    if (!sharedKey) {
      const error: ChannelErrorPayload = { cid, error: POSTMESSAGE_ERRORS.PUBLIC_ENCRYPTION_KEY_ERROR, message: 'invalid public encryption key' };
      return source.postMessage(error, origin);
    }

    if (!cid || !timestamp || !identifier || !publicKeys || !receipt) {
      const error: ChannelErrorPayload = { cid, error: POSTMESSAGE_ERRORS.CONNECT_REQUEST_OPTION_ERROR, message: 'invalid connection request options' };
      return source.postMessage(error, origin);
    }

    // check the receipt
    const openedReceipt = await this.spark.signer.verify({ signature: receipt, publicKey: publicKeys.signing });
    const decryptedReceit = await this.spark.cipher.decrypt({ data: openedReceipt, sharedKey });
    if (!openedReceipt || !decryptedReceit) {
      const error: ChannelErrorPayload = { cid, error: POSTMESSAGE_ERRORS.CONFIRM_CONNECTION_ERROR, message: 'error verifying receipt to confirm connection' };
      return source.postMessage(error, origin);
    }

    // good, sign and send back
    console.log(this._window.origin.split(':')[2] + ' received valid connection reciept')
    const encryptedRedceipt = await this.spark.cipher.encrypt({ data: decryptedReceit, sharedKey });
    const signedReceipt = await this.spark.signer.sign({ data: encryptedRedceipt });
    const payload: ChannelConfirmWithReceiptPayload = { ...data, type: CHANNEL_EVENTS.CONRIM_CONNECTION, receipt: signedReceipt };
    console.log(this._window.origin.split(':')[2] + ' sending back a connection receipt')
    source.postMessage(payload, origin);

    // setup connection and resolve promise
    console.log(this._window.origin.split(':')[2] + ' setting up channel')
    const channelOptions: ChannelArgs = { _window: this._window, spark: this.spark, cid, timestamp, origin, source, identifier, sharedKey, publicKey: publicKeys.signing, receipt };
    const channel: Channel = new PostMessage(channelOptions);

    const promise = this._connectionPromises.get(cid);
    if (promise) {
      return promise.resolve(channel);
    } else {
      const error = { error: POSTMESSAGE_ERRORS.CONFIRM_CONNECTION_ERROR, message: 'error confirming connection' };
      return source.postMessage(error, origin);
    }
  }

  private async _handleMessage(event) {
    const { data, origin } = event;
    const { mid, message }: MessagePayload = data;
    const isReady = !!(this.identifier && this.publicKey && this.sharedKey);
    if (!isReady) return;

    console.log(this._window.origin.split(':')[2] + ' opening and decrypting message')
    const openedMessage = await this.spark.signer.verify({ signature: message, publicKey: this.publicKey });
    const decryptedMessage = await this.spark.cipher.decrypt({ data: openedMessage, sharedKey: this.sharedKey });
    if (!openedMessage || !decryptedMessage) {
      const error: MessageErrorPayload = { mid, error: POSTMESSAGE_ERRORS.INVALID_MESSAGE_ERROR, message: 'error decrypting and verifying message' };
      return event.source.postMessage(error, origin);
    }

    // make a receipt
    console.log(this._window.origin.split(':')[2] + ' generating and sending message receipt')
    const receiptData: MessageData = decryptedMessage;
    const ciphertext = await this.spark.cipher.encrypt({ data: receiptData, sharedKey: this.sharedKey });
    const receipt = await this.spark.signer.sign({ data: ciphertext });
    if (!ciphertext || !receipt) {
      const error: MessageErrorPayload = { mid, error: POSTMESSAGE_ERRORS.INVALID_MESSAGE_RECEIPT_ERROR, message: 'error generating message confirmation receipt' };
      return event.source.postMessage(error, origin);
    }

    // send it back
    const payload: MessageReceiptPayload = { type: CHANNEL_EVENTS.MESSAGE_CONFIRMATION, mid, receipt };
    event.source.postMessage(payload, origin);

    if (this.onmessage) {
      const data: MessageCallbackData = { mid, ...decryptedMessage };
      return this.onmessage(data);
    }
  }

  private _handleMessageConfirmation(event) {
    const { data, origin } = event;
    const { mid, receipt }: MessageReceiptPayload = data;
    // can only handle messages when we're instantiated
    if (!this.origin || origin !== this.origin) return;

    const promise = this._messagePromises.get(mid);
    if (promise) {
      return promise.resolve(receipt);
    }

    const error: MessageErrorPayload = { mid, error: POSTMESSAGE_ERRORS.INVALID_MESSAGE_RECEIPT_ERROR, message: 'error verifying message confirmation receipt' };
    return event.source.postMessage(error, origin);
  }

  private _handleError(event) {
    const { data } = event;
    const { cid, mid, error, message } = data;
    if (cid && this._connectionPromises.has(cid)) {
      const promise = this._connectionPromises.get(cid);
      promise?.reject({ cid, error, message } as ChannelErrorPayload)
    } else if (mid && this._messagePromises.has(mid)) {
      const promise = this._messagePromises.get(mid);
      promise?.reject({ mid, error, message } as MessageErrorPayload)
    }

    if (this.onerror) {
      if (cid) return this.onerror({ cid, error, message } as ChannelErrorPayload);
      if (mid) return this.onerror({ mid, error, message } as MessageErrorPayload);
    }
  }

  // TODO - consider spliting this into closed and closed_confirmation, 
  private async _handleClosed(event) {
    // check receipt
    const { data, origin } = event;
    const { cid, receipt }: ClosedPayload = data;
    if (!cid || !receipt || !this.publicKey) return;
    const opened = await this.spark.signer.verify({ signature: receipt, publicKey: this.publicKey });
    const decrypted = await this.spark.cipher.decrypt({ data: opened, sharedKey: this.sharedKey });
    if (!opened || !decrypted) {
      const error: ChannelErrorPayload = { cid, error: POSTMESSAGE_ERRORS.INVALID_CLOSED_RECEIPT_ERROR, message: 'error verifying closed receipt' };
      return event.source.postMessage(error, origin);
    }

    // send one back
    const ciphertext = await this.spark.cipher.encrypt({ data: decrypted, sharedKey: this.sharedKey });
    const closedReceipt = await this.spark.signer.sign({ data: ciphertext });
    const payload: ClosedPayload = { type: CHANNEL_EVENTS.CONNECTION_CLOSED, cid, receipt: closedReceipt };

    // close channel
    const promise = this._closePromises.get(cid);
    this._window.removeEventListener('message', this._handler);
    this._closePromises.clear();
    this._connectionPromises.clear();
    this._messagePromises.clear();

    // resolve any promises 
    
    console.log(this._window.origin.split(':')[2] + ' closing channel with receipt');
    event.source.postMessage(payload, origin);
    if (promise) promise.resolve(receipt);
    else if (this.onclose) this.onclose(receipt);
  }

  private _handler(event) {
    const { data, origin } = event;
    if (origin === this._window.origin) return;
    if (!data || (!data.type && !data.error)) {
      return;
    } else if (data.type === CHANNEL_EVENTS.CONRIM_CONNECTION) {
      this._handleConnectionConfirmation(event);
    } else if (data.type === CHANNEL_EVENTS.MESSAGE) {
      this._handleMessage(event);
    } else if (data.type === CHANNEL_EVENTS.MESSAGE_CONFIRMATION) {
      this._handleMessageConfirmation(event);
    } else if (data.type === CHANNEL_EVENTS.CONNECTION_CLOSED) {
      this._handleClosed(event);
    } else if (data.error in POSTMESSAGE_ERRORS) {
      this._handleError(event);
    }
  }

  async open({ url }: OpenChannelArgs) {
    if (!url) throw new Error('origin is required');
    const origin = new URL(url).origin;
    const source = this._window.open(origin, '_blank');
    if (!source) throw new Error('failed to open target window');
    this.source = source;

    const cid = randomNonce(16);
    const options: ConnectionRequestOptions = {
      cid: cid,
      timestamp: getTimestamp(),
      identifier: this.spark.controller.identifier,
      publicKeys: this.spark.controller.publicKeys,
    };

    return new Promise((resolve, reject) => {
      const _resolve = (channel) => {
        console.log(this._window.origin.split(':')[2] + ' resolving promise');
        this._connectionPromises.delete(cid);
        return resolve(channel);
      }

      const _reject = (error) => {
        this._connectionPromises.delete(cid);
        return reject(error as ChannelErrorPayload);
      }

      console.log(this._window.origin.split(':')[2] + ' opening request');
      this.source.postMessage({ type: CHANNEL_EVENTS.REQUEST_CONNECTION, ...options }, origin);
      this._connectionPromises.set(cid, { resolve: _resolve, reject: _reject });
    });
  }

  async close() {
    return new Promise(async (resolve, reject) => {
      // reject any promises and return
      this._connectionPromises.forEach((promise, key) => {
        const error = { cid: key, error: POSTMESSAGE_ERRORS.CHANNEL_CLOSED_ERROR, message: 'channel is closed' };
        promise.reject(error);
      });
      this._connectionPromises.clear();

      this._messagePromises.forEach((promise, key) => {
        const error = { mid: key, error: POSTMESSAGE_ERRORS.CHANNEL_CLOSED_ERROR, message: 'channel is closed' };
        promise.reject(error);
      });
      this._messagePromises.clear();

      const closed: ClosedData = { cid: this.cid, timestamp: getTimestamp() };
      const encrypted = await this.spark.cipher.encrypt({ data: closed, sharedKey: this.sharedKey });
      const receipt = await this.spark.signer.sign({ data: encrypted });

      if (!encrypted || !receipt) {
        return reject({ error: POSTMESSAGE_ERRORS.CHANNEL_CLOSED_ERROR, message: 'error encrypting and signing close message' });
      }

      const payload: ClosedPayload = { cid: this.cid, type: CHANNEL_EVENTS.CONNECTION_CLOSED, receipt };
      this.source.postMessage(payload, this.origin);

      const callback = (result) => {
        this._closePromises.clear();
        this._window.removeEventListener('message', this._handler);
        return resolve(result);
      }

      this._closePromises.set(this.cid, { resolve: callback, reject: callback });
    });
  }

  async message(content: string | object) {
    return new Promise(async (resolve, reject) => {
      const mid = randomNonce(16);
      const timestamp = getTimestamp();
      const messageData: MessageData = { cid: this.cid, mid, timestamp, content };
      const ciphertext = await this.spark.cipher.encrypt({ data: messageData, sharedKey: this.sharedKey });
      const signature = await this.spark.signer.sign({ data: ciphertext });
      const payload: MessagePayload = { mid, type: CHANNEL_EVENTS.MESSAGE, message: signature };
      if (!ciphertext || !signature) {
        return reject({ error: POSTMESSAGE_ERRORS.INVALID_MESSAGE_ERROR, message: 'error encrypting and signing message' });
      }

      const _resolve = async (receipt) => {
        // check the receipt
        console.log(this._window.origin.split(':')[2] + ' checking message receipt')
        const openedReceipt = await this.spark.signer.verify({ signature: receipt, publicKey: this.publicKey });
        const decryptedReceit = await this.spark.cipher.decrypt({ data: openedReceipt, sharedKey: this.sharedKey });
        if (!openedReceipt || !decryptedReceit) {
          return reject({ error: POSTMESSAGE_ERRORS.INVALID_MESSAGE_RECEIPT_ERROR, message: 'error verifying message confirmation receipt' });
        }
        console.log(this._window.origin.split(':')[2] + ' resolving valid message reciept');
        this._messagePromises.delete(mid);
        return resolve(receipt);
      }

      const _reject = (error) => {
        this._messagePromises.delete(mid);
        return reject(error);
      }

      this._messagePromises.set(mid, { resolve: _resolve, reject: _reject });

      console.log(this._window.origin.split(':')[2] + ' sending message')
      this.source.postMessage(payload, this.origin);
    });
  }
}

PostMessage.receive = function (callback, spark, thisWindow) {
  const _window = thisWindow || window;
  const promises = new Map<string, (args: ChannelReceipt) => void>();
  const closed: string[] = [];
  const opened: string[] = [];

  const handleError = (event) => {
    const { data } = event;
    const { error, message }: ChannelErrorPayload = data;
  };

  const close = () => {
    _window.removeEventListener('message', handler);
  };

  const handleConnectionRequest = async (event) => {
    const { data, source, origin } = event;
    const { cid, timestamp, identifier, publicKeys }: ConnectionRequestOptions = data;
    const sharedKey = await spark.cipher.sharedKey({ publicKey: publicKeys.encryption });

    const details = { cid, timestamp, identifier, publicKeys };
    const reject = () => {
      promises.delete(cid);
      if (opened.includes(cid)) return;
      if (!closed.includes(cid)) closed.push(cid);
      const error: ChannelErrorPayload = { cid, error: POSTMESSAGE_ERRORS.CONNECTION_REJECTED_ERROR, message: 'connection request rejected' };
      source.postMessage(error, origin);
    }

    const resolve = async () => {
      return new Promise(async (resolve, reject) => {
        if (closed.includes(cid)) {
          const error: ChannelErrorPayload = { cid, error: POSTMESSAGE_ERRORS.CONNECTION_REJECTED_ERROR, message: 'connection request rejected' };
          promises.delete(cid);
          source.postMessage(error, origin);
          return resolve(error);
        }

        if (!sharedKey) {
          const error: ChannelErrorPayload = { cid, error: POSTMESSAGE_ERRORS.PUBLIC_ENCRYPTION_KEY_ERROR, message: 'invalid public encryption key' };
          return source.postMessage(error, origin);
        }

        if (!cid || !timestamp || !identifier || !publicKeys) {
          const error: ChannelErrorPayload = { cid, error: POSTMESSAGE_ERRORS.CONNECT_REQUEST_OPTION_ERROR, message: 'invalid connection request options' };
          return source.postMessage(error, origin);
        }

        const ourInfo = { identifier: spark.controller.identifier, publicKeys: spark.controller.publicKeys };
        const receiptData: ChannelRecieptData = { cid, timestamp, peers: [{ identifier, publicKeys }, ourInfo] };
        const ciphertext = await spark.cipher.encrypt({ data: receiptData, sharedKey });
        const receipt: ChannelReceipt = await spark.signer.sign({ data: ciphertext });

        if (!ciphertext || !receipt) {
          const error: ChannelErrorPayload = { cid, error: POSTMESSAGE_ERRORS.CONFIRM_CONNECTION_ERROR, message: 'error generating receipt to confirm connection' };
          return source.postMessage(error, origin);
        }

        promises.set(cid, async (receipt) => {
          // check the receipt
          const openedReceipt = await spark.signer.verify({ signature: receipt, publicKey: publicKeys.signing });
          const decryptedReceit = await spark.cipher.decrypt({ data: openedReceipt, sharedKey });
          if (!openedReceipt || !decryptedReceit) {
            return reject({ error: POSTMESSAGE_ERRORS.CONFIRM_CONNECTION_ERROR, message: 'error verifying receipt to confirm connection' });
          }
          console.log(_window.origin.split(':')[2] + ' received valid connection reciept')

          console.log(_window.origin.split(':')[2] + ' setting up channel')
          const channelOptions: ChannelArgs = { _window, spark, cid, origin, timestamp, source, identifier, sharedKey, publicKey: publicKeys.signing, receipt };
          const channel = new PostMessage(channelOptions);
          promises.delete(cid);
          if (!opened.includes(cid)) opened.push(cid);
          console.log(_window.origin.split(':')[2] + ' resolving promise')
          return resolve(channel);
        });

        const requestPayload: ConnectionRequestOptions = { cid, timestamp, ...ourInfo };
        const payload: ChannelConfirmWithReceiptPayload = { ...requestPayload, receipt, type: CHANNEL_EVENTS.CONRIM_CONNECTION };
        console.log(_window.origin.split(':')[2] + ' sending back a connection receipt')
        source.postMessage({ ...payload }, origin);
      });
    };

    callback({ details, resolve, reject });
  };

  const handleConnectionConfirmation = async (event) => {
    const { data, origin } = event;
    const { cid, receipt }: ChannelConfirmWithReceiptPayload = data;
    const promise = promises.get(cid);
    if (promise) {
      close();
      return promise(receipt);
    }
    const error: ChannelErrorPayload = { cid, error: POSTMESSAGE_ERRORS.CONFIRM_CONNECTION_ERROR, message: 'error confirming connection' };
    return event.source.postMessage(error, origin);
  };

  const handler = (event) => {
    const { data, origin } = event;
    const { cid } = data;
    const processed = cid && closed.includes(cid) || opened.includes(cid)
    if (origin === _window.origin || processed) return;
    if (!data || (!data.type && !data.error)) {
      return;
    } else if (data.type === CHANNEL_EVENTS.REQUEST_CONNECTION) {
      return handleConnectionRequest(event);
    } else if (data.type === CHANNEL_EVENTS.CONRIM_CONNECTION) {
      return handleConnectionConfirmation(event);
    } else if (data.error in POSTMESSAGE_ERRORS) {
      return handleError(event);
    }
  }

  _window.addEventListener('message', handler);
  _window.addEventListener('beforeunload', () => {
    _window.removeEventListener('message', handler);
  });
}

