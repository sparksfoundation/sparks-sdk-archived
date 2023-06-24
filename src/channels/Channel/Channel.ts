import { SharedEncryptionKey } from "../../ciphers";
import { Identifier, PublicKeys } from "../../controllers";
import { SparksChannel } from "./types";
import { getTimestamp, randomNonce } from "../../utilities";
import { ISpark } from "../../Spark";

export interface IChannel { }

export class Channel implements IChannel {
  private promises: Map<SparksChannel.Eid, SparksChannel.Event.Promise> = new Map();
  private requestHandler: SparksChannel.RequestHandler;
  private messageHandler: SparksChannel.Message.Handler;
  private closeHandler: SparksChannel.Close.Handler;
  private errorHandler: SparksChannel.Error.Handler;
  private openHandler: SparksChannel.Open.Handler;
  private spark: ISpark<any, any, any, any, any>;
  private pendingMessages: SparksChannel.Event.Message[] = [];

  public sharedKey: SharedEncryptionKey;
  public opened: boolean = false;
  public eventLog: SparksChannel.EventLog = [];
  public cid: SparksChannel.Cid;
  public peer: {
    identifier: Identifier,
    publicKeys: PublicKeys,
  }

  constructor({ spark, cid }: { cid?: SparksChannel.Cid, spark: ISpark<any, any, any, any, any> }) {
    this.spark = spark;
    this.cid = cid || randomNonce(16);
    this.eventLog = [];
  }

  // utilities
  private async sealData(
    data: SparksChannel.Receipt.Any,
    event?: SparksChannel.Event.Any
  ): Promise<{
    error: SparksChannel.Error.CreateCiphertext | null,
    ciphertext: SparksChannel.Receipt.Cipher
  }> {

    let error: SparksChannel.Error.CreateCiphertext = null;
    const sharedKey = this.sharedKey;
    const encrypted = sharedKey ? await this.spark.encrypt({ sharedKey, data }) : null;
    const ciphertext = encrypted ? await this.spark.sign({ data: encrypted }) : null;

    if (!ciphertext) {
      error = {
        eid: event.eid,
        type: SparksChannel.Error.Types.CREATE_CIPHERTEXT_ERROR,
        message: 'failed to create ciphertext',
        cid: this.cid,
        timestamp: getTimestamp(),
      };

    }

    return { ciphertext, error }
  }

  private async openCipher(
    receipt: SparksChannel.Receipt.Cipher | SparksChannel.Message.Cipher,
    event?: SparksChannel.Event.Any
  ): Promise<{
    data: string | Record<string, any>,
    error: SparksChannel.Error.OpenCiphertext | null,
  }> {

    let error: SparksChannel.Error.OpenCiphertext = null;
    const peer = this.peer;
    const sharedKey = this.sharedKey;
    const openedCipher = sharedKey ? await this.spark.verify({ signature: receipt, publicKey: peer.publicKeys.signing }) : null;
    const decryptedCipher = openedCipher ? await this.spark.decrypt({ sharedKey, data: openedCipher }) : null;

    if (!decryptedCipher) {
      error = {
        type: SparksChannel.Error.Types.OPEN_CIPHERTEXT_ERROR,
        eid: event.eid,
        message: 'failed to open ciphertext',
        cid: this.cid,
        timestamp: getTimestamp(),
      };
      
    }

    return { data: decryptedCipher, error };
  }

  private async setPeer(
    event: SparksChannel.Event.OpenRequest | SparksChannel.Event.OpenAccept
  ): Promise<{
    error: SparksChannel.Error.ComputeSharedKey | SparksChannel.Error.InvalidPublicKeys | SparksChannel.Error.InvalidIdentifier,
  }> {

    let error: SparksChannel.Error.ComputeSharedKey | SparksChannel.Error.InvalidPublicKeys | SparksChannel.Error.InvalidIdentifier = null;
    const identifier = event.identifier;
    const signing = event.publicKeys.signing;
    const encryption = event.publicKeys.encryption;
    const publicKeys = { signing, encryption };
    const pendingSharedKey = await this.spark.computeSharedKey({ publicKey: publicKeys.encryption });

    if (!identifier || !signing || !encryption || !pendingSharedKey) {
      let type, msg;
      switch (true) {
        case !identifier:
          type = SparksChannel.Error.Types.INVALID_IDENTIFIER;
          msg = 'invalid identifier';
          break;
        case !signing || !encryption:
          type = SparksChannel.Error.Types.INVALID_PUBLIC_KEYS;
          msg = 'invalid public keys';
          break;
        case !pendingSharedKey:
          type = SparksChannel.Error.Types.COMPUTE_SHARED_KEY_ERROR;
          msg = 'failed to compute shared key';
          break;
      }

      error = {
        type,
        eid: event.eid,
        message: msg,
        cid: this.cid,
        timestamp: getTimestamp(),
      };
      
    }

    this.peer = { identifier, publicKeys };
    this.sharedKey = pendingSharedKey;
    return { error };
  }

  private getPromise(
    event: SparksChannel.Event.Any | SparksChannel.Error.Any
  ): {
    promise: SparksChannel.Event.Promise,
    error: SparksChannel.Error.EventPromise | null
  } {
    const promise = this.promises.get(event.eid);
    if (!promise) {
      const error: SparksChannel.Error.EventPromise = {
        eid: event.eid,
        type: SparksChannel.Error.Types.EVENT_PROMISE_ERROR,
        message: 'missing event promise for event ' + event.type,
        cid: this.cid,
        timestamp: getTimestamp(),
      };
      return { promise: null, error };
    }
    return { promise, error: null };
  }

  private async request(
    event: SparksChannel.Event.Any | SparksChannel.Error.Any
  ): Promise<{
    error: SparksChannel.Error.SendRequest | null,
  }> {
    let error: SparksChannel.Error.SendRequest | null = null;
    try {
      // check if it's an error event 
      const type = event.type as SparksChannel.Error.Types;
      const isError = Object.values(SparksChannel.Error.Types).includes(type);
      if (isError && this.errorHandler) {
        this.errorHandler({ error: event as SparksChannel.Error.Any });
      }
      await this.requestHandler(event);
      this.eventLog.push({ response: true, ...event });
    } catch (err) {
      error = {
        eid: event.eid,
        type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
        message: err.message || 'failed to send request',
        cid: this.cid,
        timestamp: getTimestamp(),
      };
      this.eventLog.push({ response: true, ...error });
      if (this.errorHandler) {
        this.errorHandler({ error });
      }
    }
    return { error };
  }

  public async handleResponse(event) {
    const isEvent = Object.values(SparksChannel.Event.Types).includes(event.type);
    const isError = Object.values(SparksChannel.Error.Types).includes(event.type);
    if (!isEvent && !isError) return;

    const type = isError ? SparksChannel.Error.Types.UNEXPECTED_ERROR : event.type;
    if (isEvent || isError) {
      this.eventLog.push({ request: true, ...event });
    }
    switch (true) {
      case type === SparksChannel.Event.Types.OPEN_REQUEST:
        return this.onOpenRequested(event);
      case type === SparksChannel.Event.Types.OPEN_ACCEPT:
        return this.onOpenAccepted(event);
      case type === SparksChannel.Event.Types.OPEN_CONFIRM:
        return this.onOpenConfirmed(event);
      case this.opened && type === SparksChannel.Event.Types.MESSAGE:
        return this.onMessage(event);
      case !this.opened && type === SparksChannel.Event.Types.MESSAGE:
        return this.pendingMessages.push(event);
      case type === SparksChannel.Event.Types.MESSAGE_CONFIRM:
        return this.onMessageConfirmed(event);
      case type === SparksChannel.Event.Types.CLOSE:
        return this.onClose(event);
      case type === SparksChannel.Event.Types.CLOSE_CONFIRM:
        return this.onCloseConfirmed(event);
      case type === SparksChannel.Error.Types.UNEXPECTED_ERROR:
        return this.handleResponseError(event);
      default:
        return;
    }
  }

  private handleResponseError(error: SparksChannel.Error.Any) {
    const { promise } = this.getPromise(error);
    if (promise) {
      promise.reject(error);
      this.promises.delete(error.eid);
    }
    if (this.errorHandler) {
      this.errorHandler({ error });
    }
  }

  // open flow
  public open() {
    return new Promise(async (resolve, reject) => {
      const event: SparksChannel.Event.OpenRequest = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.OPEN_REQUEST,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys,
      };

      this.promises.set(event.eid, { resolve, reject });

      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.promises.delete(event.eid);
        return reject(requestError);
      }
    });
  }

  private onOpenRequested(requestEvent: SparksChannel.Event.OpenRequest) {
    return new Promise(async (resolve, reject) => {
      const { error: setPeerError } = await this.setPeer(requestEvent);
      if (setPeerError) {
        this.request(setPeerError);
        return reject(setPeerError);
      }

      const receiptData: SparksChannel.Receipt.OpenAccepted = {
        type: SparksChannel.Receipt.Types.OPEN_ACCEPTED,
        cid: this.cid,
        timestamp: getTimestamp(),
        peers: [
          { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
          { identifier: this.peer.identifier, publicKeys: this.peer.publicKeys },
        ]
      };

      const { error: sealError, ciphertext: receipt } = await this.sealData(receiptData, requestEvent);
      if (sealError) {
        const message = 'error creating open accept receipt';
        this.request({ ...sealError, message });
        return reject({ ...sealError, message });
      }

      const event: SparksChannel.Event.OpenAccept = {
        eid: requestEvent.eid,
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.OPEN_ACCEPT,
        receipt,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys,
      };

      this.promises.set(requestEvent.eid, { resolve, reject });

      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.promises.delete(requestEvent.eid);
        this.request(requestError);
        return reject(requestError);
      }
    });
  }

  public async acceptOpen(requestEvent) {
    this.eventLog.push({ request: true, requestEvent });
    return await this.onOpenRequested(requestEvent);
  }

  public async rejectOpen(requestEvent) {
    const event: SparksChannel.Error.OpenRequestRejected = {
      eid: requestEvent.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Error.Types.OPEN_REQUEST_REJECTED,
      message: 'Open request rejected',
    }
    await this.request(event);
  }

  private async onOpenAccepted(acceptEvent: SparksChannel.Event.OpenAccept) {
    const { promise, error: promiseError } = this.getPromise(acceptEvent);
    if (promiseError) {
      this.request(promiseError);
      return;
    }

    const { error: setPeerError } = await this.setPeer(acceptEvent);
    if (setPeerError) {
      this.request(setPeerError);
      promise.reject(setPeerError);
      this.promises.delete(acceptEvent.eid);
      return;
    }

    const { error: validReceiptError } = await this.openCipher(acceptEvent.receipt, acceptEvent);
    if (validReceiptError) {
      this.request(validReceiptError);
      promise.reject(validReceiptError);
      this.promises.delete(acceptEvent.eid);
      return;
    }

    const receiptData: SparksChannel.Receipt.OpenConfirmed = {
      type: SparksChannel.Receipt.Types.OPEN_CONFIRMED,
      cid: this.cid,
      timestamp: getTimestamp(),
      peers: [
        { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
        { identifier: acceptEvent.identifier, publicKeys: acceptEvent.publicKeys },
      ]
    };

    const { ciphertext: receipt, error: sealError } = await this.sealData(receiptData, acceptEvent)
    if (sealError) {
      const message = 'error creating open confirm receipt';
      this.request({ ...sealError, message });
      promise.reject({ ...sealError, message });
      this.promises.delete(acceptEvent.eid);
      return;
    }

    const event: SparksChannel.Event.OpenConfirm = {
      eid: acceptEvent.eid ? acceptEvent.eid : '',
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Event.Types.OPEN_CONFIRM,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
      receipt,
    };

    const { error: requestError } = await this.request(event);

    if (requestError) {
      this.request(requestError);
      promise.reject(requestError);
      this.promises.delete(acceptEvent.eid);
      return
    }

    this.completeOpen(acceptEvent);
  }

  private async onOpenConfirmed(confirmEvent: SparksChannel.Event.OpenConfirm) {
    const { error: validReceiptError } = await this.openCipher(confirmEvent.receipt, confirmEvent);
    if (validReceiptError) {
      this.request(validReceiptError);
      const { promise } = this.getPromise(confirmEvent);
      promise.reject(validReceiptError);
      this.promises.delete(confirmEvent.eid);
      return;
    }
    this.completeOpen(confirmEvent);
  }

  private async completeOpen(confirmOrAcceptEvent: SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenConfirm) {
    const { promise } = this.getPromise(confirmOrAcceptEvent);
    if (!promise) return;
    promise.resolve(confirmOrAcceptEvent);
    this.promises.delete(confirmOrAcceptEvent.eid);
    this.opened = true;
    this.pendingMessages.forEach((pendingMessage) => {
      this.onMessage(pendingMessage);
    });
    this.pendingMessages = [];
    if (this.openHandler) {
      this.openHandler({ event: confirmOrAcceptEvent });
    }
  }

  // message flow
  public send(payload: SparksChannel.Message.Data) {
    return new Promise(async (resolve, reject) => {
      if (!this.opened) return reject('Channel not opened');
      // send the payload, wait for response, log receipt
      const encrypted = await this.spark.encrypt({ data: payload, sharedKey: this.sharedKey });
      const ciphertext = await this.spark.sign({ data: encrypted });

      const event: SparksChannel.Event.Message = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.MESSAGE,
        mid: randomNonce(16),
        ciphertext,
      }

      this.promises.set(event.eid, { resolve, reject });
      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.request(requestError);
        return reject(requestError);
      }
    });
  }

  private async onMessage(messageEvent: SparksChannel.Event.Message): Promise<void> {
    const { data, error } = await this.openCipher(messageEvent.ciphertext, messageEvent);
    if (error) {
      this.request({ ...error, message: 'error decrypting message' });
      return;
    }
    console.log('message completing 0')

    const receiptData: SparksChannel.Receipt.MessageConfirmed = {
      type: SparksChannel.Receipt.Types.MESSAGE_CONFIRMED,
      cid: this.cid,
      timestamp: getTimestamp(),
      mid: messageEvent.mid,
      data: data,
    }

    const { ciphertext: receipt, error: receiptError } = await this.sealData(receiptData, messageEvent);
    if (receiptError) {
      this.request({ ...receiptError, message: 'error creating message receipt' });
      return;
    }
    console.log('message completing 1')


    const event: SparksChannel.Event.MessageConfirm = {
      eid: messageEvent.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Event.Types.MESSAGE_CONFIRM,
      mid: messageEvent.mid,
      receipt,
    };

    const { error: requestError } = await this.request(event);
    if (requestError) {
      this.request(requestError);
      return;
    }

    console.log('message completing 2')
    this.completeMessage(messageEvent, data);
  }

  private async onMessageConfirmed(confirmEvent: SparksChannel.Event.MessageConfirm) {
    const { promise } = this.getPromise(confirmEvent);
    if (!promise) return;

    const { data: payload, error: validReceiptError } = await this.openCipher(confirmEvent.receipt, confirmEvent);
    if (validReceiptError) {
      this.request(validReceiptError);
      promise.reject(validReceiptError);
      this.promises.delete(confirmEvent.eid);
      return;
    }
    this.promises.delete(confirmEvent.eid);
    promise.resolve(confirmEvent);
    this.completeMessage(confirmEvent, payload);
  }

  private async completeMessage(messageRequestOrConfirm: SparksChannel.Event.Message | SparksChannel.Event.MessageConfirm, data: SparksChannel.Message.Data) {
    const { promise } = this.getPromise(messageRequestOrConfirm);
    if (promise) {
      promise.resolve(messageRequestOrConfirm);
      this.promises.delete(messageRequestOrConfirm.eid);
    }
    if (this.messageHandler) {
      this.messageHandler({ event: messageRequestOrConfirm, data });
    }
  }

  // close flow
  public close() {
    // send close request, wait for response, log receipt
    return new Promise(async (resolve, reject) => {
      if (!this.opened) return reject('Channel already closed');

      const event: SparksChannel.Event.Close = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.CLOSE,
      }

      this.promises.set(event.eid, { resolve, reject });
      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.request(requestError);
        return reject(requestError);
      }
    });
  }

  private async onClose(requestEvent: SparksChannel.Event.Close) {
    // just like onMessage but for closeRequest
    const receiptData: SparksChannel.Receipt.CloseConfirmed = {
      type: SparksChannel.Receipt.Types.CLOSE_CONFIRMED,
      cid: this.cid,
      timestamp: getTimestamp(),
    };

    const { ciphertext: receipt, error: receiptError } = await this.sealData(receiptData, requestEvent);
    if (receiptError) {
      this.request({ ...receiptError, message: 'error creating close receipt' });
      return;
    }

    const event: SparksChannel.Event.CloseConfirm = {
      eid: requestEvent.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Event.Types.CLOSE_CONFIRM,
      receipt,
    };

    const { error: requestError } = await this.request(event);
    if (requestError) {
      this.request(requestError);
      return;
    }

    this.completeClose(requestEvent);
  }

  private async onCloseConfirmed(confirmEvent: SparksChannel.Event.CloseConfirm) {
    const { promise } = this.getPromise(confirmEvent);
    if (!promise) return;

    const { error: validReceiptError } = await this.openCipher(confirmEvent.receipt, confirmEvent);
    if (validReceiptError) {
      this.request(validReceiptError);
      promise.reject(validReceiptError);
      this.promises.delete(confirmEvent.eid);
      return;
    }

    this.promises.delete(confirmEvent.eid);
    promise.resolve(confirmEvent);
    this.completeClose(confirmEvent);
  }

  private completeClose(requestOrConfirmEvent: SparksChannel.Event.Close | SparksChannel.Event.CloseConfirm) {
    this.opened = false;
    this.pendingMessages = [];
    this.promises.clear();
    this.peer = null;
    this.sharedKey = null;
    if (this.closeHandler) {
      this.closeHandler({ event: requestOrConfirmEvent });
    }
  }

  public setRequestHandler(callback: SparksChannel.RequestHandler) {
    this.requestHandler = callback;
  }

  public setMessageHandler(callback: SparksChannel.Message.Handler) {
    this.messageHandler = callback;
  }

  public setOpenHandler(callback: SparksChannel.Open.Handler) {
    this.openHandler = callback;
  }

  public setCloseHandler(callback: SparksChannel.Close.Handler) {
    this.closeHandler = callback;
  }

  public setErrorHandler(callback: SparksChannel.Error.Handler) {
    this.errorHandler = callback;
  }
}