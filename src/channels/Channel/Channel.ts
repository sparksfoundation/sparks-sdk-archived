import { SharedEncryptionKey } from "../../ciphers";
import { Identifier, PublicKeys } from "../../controllers";
import { SparksChannel } from "./types";
import { getTimestamp, randomNonce } from "../../utilities";
import { ISpark, Spark } from "../../Spark";

export interface IChannel { }

export class Channel implements IChannel {
  private promises: Map<SparksChannel.Eid, SparksChannel.Event.Promise> = new Map();
  private requestHandler: SparksChannel.RequestHandler;
  private spark: ISpark<any, any, any, any, any>;
  private sharedKey: SharedEncryptionKey;
  private pendingMessages: SparksChannel.Event.MessageRequest[] = [];

  public opened: boolean = false;
  public receipts: any[];
  public cid: SparksChannel.Cid;
  public peer: {
    identifier: Identifier,
    publicKeys: PublicKeys,
  }

  constructor({ spark, cid }: { cid?: SparksChannel.Cid, spark: ISpark<any, any, any, any, any> }) {
    this.spark = spark;
    this.cid = cid || randomNonce(16);
    this.receipts = [];
  }

  // utilities
  private async logReceipt(receiptCipher: SparksChannel.Receipt.Cipher) {
    const peer = this.peer;
    const sharedKey = this.sharedKey;
    const opened = await this.spark.verify({ signature: receiptCipher, publicKey: peer.publicKeys.signing });
    const decrypted = await this.spark.decrypt({ sharedKey, data: opened });
    const receipt = {
      ...decrypted,
      ciphertext: receiptCipher,
    }
    this.receipts.push(receipt);
  }

  private async sealReceipt(
    data: SparksChannel.Receipt.Any,
    event?: SparksChannel.Event.Any
  ): Promise<{
    error: SparksChannel.Error.ReceiptCreation | null,
    receipt: SparksChannel.Receipt.Cipher
  }> {

    let error: SparksChannel.Error.ReceiptCreation = null;
    const sharedKey = this.sharedKey;
    const encrypted = sharedKey ? await this.spark.encrypt({ sharedKey, data }) : null;
    const receipt = encrypted ? await this.spark.sign({ data: encrypted }) : null;

    if (!receipt) {
      error = {
        eid: event.eid,
        type: SparksChannel.Error.Types.RECEIPT_CREATION_ERROR,
        message: 'failed to create receipt',
        cid: this.cid,
        timestamp: getTimestamp(),
      };
    }

    return { receipt, error }
  }

  private async verifyReceipt(
    receipt: SparksChannel.Receipt.Cipher,
    event?: SparksChannel.Event.Any
  ): Promise<{
    valid: boolean,
    error: SparksChannel.Error.ReceiptVerification
  }> {

    let error: SparksChannel.Error.ReceiptVerification = null;
    const peer = this.peer;
    const sharedKey = this.sharedKey;
    const openedReceipt = sharedKey ? await this.spark.verify({ signature: receipt, publicKey: peer.publicKeys.signing }) : null;
    const decryptedReceipt = openedReceipt ? await this.spark.decrypt({ sharedKey, data: openedReceipt }) : null;

    if (!decryptedReceipt) {
      error = {
        type: SparksChannel.Error.Types.RECEIPT_VERIFICATION_ERROR,
        eid: event.eid,
        message: 'failed to verify receipt',
        cid: this.cid,
        timestamp: getTimestamp(),
      };
    }

    return { valid: !!decryptedReceipt, error };
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
    eid: SparksChannel.Eid
  ): {
    promise: SparksChannel.Event.Promise,
    error: SparksChannel.Error.EventPromise | null
  } {
    const promise = this.promises.get(eid);
    if (!promise) {
      const error: SparksChannel.Error.EventPromise = {
        eid,
        type: SparksChannel.Error.Types.EVENT_PROMISE_ERROR,
        message: 'missing event promise',
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
    error: SparksChannel.Error.Unexpected | null,
  }> {
    let error: SparksChannel.Error.Unexpected | null = null;
    try {
      this.requestHandler(event)
    } catch (err) {
      error = {
        eid: event.eid,
        type: SparksChannel.Error.Types.UNEXPECTED_ERROR,
        message: 'failed to send request',
        cid: this.cid,
        timestamp: getTimestamp(),
      };
    }

    return { error };
  }

  public handleResponses(event) {
    let type = event.type;
    type = Object.values(SparksChannel.Error.Types).includes(type) ? SparksChannel.Error.Types.UNEXPECTED_ERROR : type;
    switch (type) {
      case SparksChannel.Event.Types.OPEN_REQUEST:
        this.onOpenRequested(event);
        break;
      case SparksChannel.Event.Types.OPEN_ACCEPT:
        this.onOpenAccepted(event);
        break;
      case SparksChannel.Event.Types.OPEN_CONFIRM:
        this.onOpenConfirmed(event);
        break;
      case SparksChannel.Event.Types.MESSAGE_REQUEST:
        if (this.opened) this.onMessageRequest(event);
        else this.pendingMessages.push(event);
        break;
      case SparksChannel.Event.Types.MESSAGE_CONFIRM:
        this.onMessageConfirmed(event);
        break;
      case SparksChannel.Error.Types.UNEXPECTED_ERROR:
        const { promise } = this.getPromise(event.eid);
        if (!promise) throw new Error(event);
        promise.reject(event);
        this.promises.delete(event.eid);
        break;
    }
  }

  // open flow
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

      const { error: receiptError, receipt } = await this.sealReceipt(receiptData, requestEvent);
      if (receiptError) {
        this.request(receiptError);
        return reject(receiptError);
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

  private async onOpenAccepted(acceptEvent: SparksChannel.Event.OpenAccept) {
    const { promise, error: promiseError } = this.getPromise(acceptEvent.eid);
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

    const { error: validReceiptError } = await this.verifyReceipt(acceptEvent.receipt);
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

    const { receipt, error: receiptError } = await this.sealReceipt(receiptData, acceptEvent)
    if (receiptError) {
      this.request(receiptError);
      promise.reject(receiptError);
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
    const { error: validReceiptError } = await this.verifyReceipt(confirmEvent.receipt);
    if (validReceiptError) {
      this.request(validReceiptError);
      const { promise } = this.getPromise(confirmEvent.eid);
      promise.reject(validReceiptError);
      this.promises.delete(confirmEvent.eid);
      return;
    }
    this.completeOpen(confirmEvent);
  }

  private async completeOpen(confirmOrAcceptEvent: SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenConfirm) {
    const { promise } = this.getPromise(confirmOrAcceptEvent.eid);
    if (!promise) return;
    await this.logReceipt(confirmOrAcceptEvent.receipt);    
    promise.resolve(confirmOrAcceptEvent);
    this.promises.delete(confirmOrAcceptEvent.eid);
    this.opened = true;
    this.pendingMessages.forEach((pendingMessage) => {
      this.onMessageRequest(pendingMessage);
    });
    this.pendingMessages = [];
  }

  // message flow
  private onMessageRequest(messageRequest: SparksChannel.Event.MessageRequest): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const receiptData: SparksChannel.Receipt.MessageConfirmed = {
        type: SparksChannel.Receipt.Types.MESSAGE_RECEIVED,
        cid: this.cid,
        timestamp: getTimestamp(),
        mid: messageRequest.mid,
        payload: messageRequest.payload,
      }

      const { receipt, error: receiptError } = await this.sealReceipt(receiptData, messageRequest);
      if (receiptError) {
        this.request(receiptError);
        return reject(receiptError);
      }

      const event: SparksChannel.Event.MessageConfirm = {
        eid: messageRequest.eid,
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.MESSAGE_CONFIRM,
        mid: messageRequest.mid,
        receipt,
      };

      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.request(requestError);
        return reject(requestError);
      }

      resolve();
    });
  }

  private async onMessageConfirmed(confirmEvent: SparksChannel.Event.MessageConfirm) {
    const { promise } = this.getPromise(confirmEvent.eid);
    if (!promise) return;

    const { error: validReceiptError } = await this.verifyReceipt(confirmEvent.receipt);
    if (validReceiptError) {
      this.request(validReceiptError);
      promise.reject(validReceiptError);
      this.promises.delete(confirmEvent.eid);
      return;
    }

    await this.logReceipt(confirmEvent.receipt);
    this.promises.delete(confirmEvent.eid);
    promise.resolve(confirmEvent);
  }

  // public methods
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

  public async acceptOpen(requestEvent) {
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

  public send(payload: SparksChannel.Message.Payload) {
    return new Promise(async (resolve, reject) => {
      if (!this.opened) return reject('Channel not opened');
      // send the payload, wait for response, log receipt
      const event: SparksChannel.Event.MessageRequest = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.MESSAGE_REQUEST,
        mid: randomNonce(16),
        payload,
      }

      this.promises.set(event.eid, { resolve, reject });
      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.request(requestError);
        return reject(requestError);
      }
    });
  }

  public close() { }

  public sendRequests(callback: SparksChannel.RequestHandler) {
    this.requestHandler = callback;
  }
}