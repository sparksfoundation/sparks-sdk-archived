import { SharedEncryptionKey } from "../../ciphers";
import { EncryptionPublicKey, Identifier, PublicKeys, SigningPublicKey } from "../../controllers";
import { SparksChannel } from "./types";
import { getTimestamp, randomNonce } from "../../utilities";
import { ISpark, Spark } from "../../Spark";

export interface IChannel { }

export class Channel implements IChannel {
  private openingPromises: Map<SparksChannel.Eid, { resolve, reject }> = new Map();
  private messagePromises: Map<SparksChannel.Eid, { resolve, reject }> = new Map();

  private requestHandler: SparksChannel.RequestHandler;
  private spark: ISpark<any, any, any, any, any>;
  public cid: SparksChannel.Cid;
  public peer: {
    identifier: Identifier,
    publicKeys: PublicKeys,
    sharedKey: SharedEncryptionKey,
  }
  public receipts: any[];

  public accept: (event) => boolean;

  constructor({ spark, cid }: { cid?: SparksChannel.Cid, spark: ISpark<any, any, any, any, any> }) {
    this.spark = spark;
    this.cid = cid || randomNonce(16);
    this.receipts = [];
    this.peer = {
      identifier: null,
      publicKeys: null,
      sharedKey: null,
    }
  }

  private async logReceipt(receiptCipher: SparksChannel.Receipt.Cipher) {
    const opened = await this.spark.verify({ signature: receiptCipher, publicKey: this.peer.publicKeys.signing });
    const decrypted = await this.spark.decrypt({ sharedKey: this.peer.sharedKey, data: opened });
    const receipt = {
      ...decrypted,
      ciphertext: receiptCipher,
    }
    this.receipts.push(receipt);
  }

  private async sealReceipt(data: SparksChannel.Receipt.Any): Promise<string | null> {
    if (!this.peer.sharedKey) return null;

    const encrypted = await this.spark.encrypt({ sharedKey: this.peer.sharedKey, data });
    if (!encrypted) return null;

    const signature = await this.spark.sign({ data: encrypted });
    if (!signature) return null;

    return signature;
  }

  private async verifyReceipt(event): Promise<boolean> {
    if (!this.peer.sharedKey) return false;

    const openedReceipt = await this.spark.verify({ signature: event.receipt, publicKey: event.publicKeys.signing });
    if (!openedReceipt) return false;

    const decryptedReceipt = await this.spark.decrypt({ sharedKey: this.peer.sharedKey, data: openedReceipt });
    if (!decryptedReceipt) return false;

    return true;
  }

  open() {
    return new Promise(async (resolve, reject) => {
      const event: SparksChannel.Event.OpenRequest = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.OPEN_REQUEST,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys,
      };

      this.openingPromises.set(event.eid, { resolve, reject });
      const responseSent = await this.request(event);

      if (!responseSent) {
        this.openingPromises.delete(event.eid);
        const error: SparksChannel.Error.SendRequest = {
          eid: event.eid,
          type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
          message: 'failed to send open request',
          cid: this.cid,
          timestamp: getTimestamp(),
        };
        return reject(error);
      }
    });
  }

  async setPeer(event: SparksChannel.Event.OpenRequest | SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenConfirm) {
    const sharedKey = await this.spark.computeSharedKey({ publicKey: event.publicKeys.encryption });
    const identifier = event.identifier;
    const publicKeys = event.publicKeys;
    this.peer = { identifier, publicKeys, sharedKey };
  }

  onOpenRequested(requestEvent: SparksChannel.Event.OpenRequest) {
    return new Promise(async (resolve, reject) => {
      const receiptData: SparksChannel.Receipt.OpenConfirmed = {
        type: SparksChannel.Receipt.Types.OPEN_CONFIRMED,
        cid: this.cid,
        timestamp: getTimestamp(),
        peers: [
          { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
          { identifier: requestEvent.identifier, publicKeys: requestEvent.publicKeys },
        ]
      };

      await this.setPeer(requestEvent);
      const receipt = await this.sealReceipt(receiptData);
      
      if (!receipt) {
        const error: SparksChannel.Error.ReceiptCreation = {
          eid: requestEvent.eid,
          type: SparksChannel.Error.Types.RECEIPT_CREATION_ERROR,
          message: 'failed to create receipt',
          cid: this.cid,
          timestamp: getTimestamp(),
        };
        this.request(error);
        return reject(error);
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

      this.openingPromises.set(requestEvent.eid, { resolve, reject });
      const responseSent = await this.request(event);

      if (!responseSent) {
        this.openingPromises.delete(requestEvent.eid);
        const error: SparksChannel.Error.SendRequest = {
          eid: requestEvent.eid,
          type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
          message: 'failed to send open accept',
          cid: this.cid,
          timestamp: getTimestamp(),
        };
        this.request(error);
        return reject(error);
      }
    });
  }

  async onOpenAccepted(acceptEvent: SparksChannel.Event.OpenAccept) {
    if (!this.openingPromises.has(acceptEvent.eid)) {
      const error: SparksChannel.Error.EventPromise = {
        eid: acceptEvent.eid,
        type: SparksChannel.Error.Types.EVENT_PROMISE_ERROR,
        message: 'missing event promise',
        cid: this.cid,
        timestamp: getTimestamp(),
      }
      this.request(error);
      return;
    }

    await this.setPeer(acceptEvent);
    const promise = this.openingPromises.get(acceptEvent.eid);
    const validReceipt = await this.verifyReceipt(acceptEvent);
    if (!validReceipt) {
      const error: SparksChannel.Error.ReceiptVerification = {
        eid: acceptEvent.eid,
        type: SparksChannel.Error.Types.RECEIPT_VERIFICATION_ERROR,
        message: 'receipt verification failed',
        cid: this.cid,
        timestamp: getTimestamp(),
      }
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
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

    const receipt = await this.sealReceipt(receiptData)
    if (!receipt) {
      const error: SparksChannel.Error.ReceiptCreation = {
        eid: acceptEvent.eid,
        type: SparksChannel.Error.Types.RECEIPT_CREATION_ERROR,
        message: 'failed to create receipt',
        cid: this.cid,
        timestamp: getTimestamp(),
      }
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
      return;
    }

    const event: SparksChannel.Event.OpenConfirm = {
      eid: acceptEvent.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Event.Types.OPEN_CONFIRM,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
      receipt,
    };

    const responseSent = await this.request(event);
    if (!responseSent) {
      const error: SparksChannel.Error.SendRequest = {
        eid: acceptEvent.eid,
        type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
        message: 'failed to send open confirm',
        cid: this.cid,
        timestamp: getTimestamp(),
      }
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
      return
    }

    this.completeOpen(acceptEvent);
  }

  async onOpenConfirmed(confirmEvent: SparksChannel.Event.OpenConfirm) {
    const validReceipt = await this.verifyReceipt(confirmEvent);
    if (!validReceipt) {
      const error: SparksChannel.Error.ReceiptVerification = {
        eid: confirmEvent.eid,
        type: SparksChannel.Error.Types.RECEIPT_VERIFICATION_ERROR,
        message: 'receipt verification failed',
        cid: this.cid,
        timestamp: getTimestamp(),
      }
      this.request(error);
      this.openingPromises.get(confirmEvent.eid).reject(error);
      this.openingPromises.delete(confirmEvent.eid);
      return;
    }

    this.completeOpen(confirmEvent);
  }

  async completeOpen(data: SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenConfirm) {
    const promise = this.openingPromises.get(data.eid);
    if (!promise) return;

    const sharedKey = await this.spark.computeSharedKey({ publicKey: data.publicKeys.encryption });
    if (!sharedKey) {
      const error: SparksChannel.Error.SharedKeyCreation = {
        eid: data.eid,
        type: SparksChannel.Error.Types.SHARED_KEY_CREATION_ERROR,
        message: 'failed to create shared key',
        cid: this.cid,
        timestamp: getTimestamp(),
      }
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(data.eid);
      return;
    }

    this.peer = {
      identifier: data.identifier,
      publicKeys: data.publicKeys,
      sharedKey: sharedKey,
    }

    await this.logReceipt(data.receipt);
    promise.resolve(this);
    this.openingPromises.delete(data.eid);
    console.log('event: OPEN_COMPLETE');
  }

  send(payload: SparksChannel.Message.Payload) {
    return new Promise(async (resolve, reject) => {
      // send the payload, wait for response, log receipt
      const event: SparksChannel.Event.MessageRequest = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.MESSAGE_REQUEST,
        mid: randomNonce(16),
        payload,
      }

      this.messagePromises.set(event.eid, { resolve, reject });
      const responseSent = await this.request(event);
      if (!responseSent) {
        this.messagePromises.delete(event.eid);
        const error: SparksChannel.Error.SendRequest = {
          eid: event.eid,
          type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
          message: 'failed to send message',
          cid: this.cid,
          timestamp: getTimestamp(),
        }
        this.request(error);
        return reject(error);
      }
    });
  }

  onMessageRequest(messageRequest: SparksChannel.Event.MessageRequest): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const validReceipt = await this.verifyReceipt(messageRequest);
      if (!validReceipt) {
        const error: SparksChannel.Error.ReceiptVerification = {
          eid: messageRequest.eid,
          type: SparksChannel.Error.Types.RECEIPT_VERIFICATION_ERROR,
          message: 'receipt verification failed',
          cid: this.cid,
          timestamp: getTimestamp(),
        }
        this.request(error);
        return reject(error);
      }

      const receiptData: SparksChannel.Receipt.MessageConfirmed = {
        type: SparksChannel.Receipt.Types.MESSAGE_RECEIVED,
        cid: this.cid,
        timestamp: getTimestamp(),
        mid: messageRequest.mid,
        payload: messageRequest.payload,
      }

      const receipt = await this.sealReceipt(receiptData);
      if (!receipt) {
        const error: SparksChannel.Error.ReceiptCreation = {
          eid: messageRequest.eid,
          type: SparksChannel.Error.Types.RECEIPT_CREATION_ERROR,
          message: 'failed to create message receipt',
          cid: this.cid,
          timestamp: getTimestamp(),
        }
        this.request(error);
        return reject(error);
      }

      const event: SparksChannel.Event.MessageConfirm = {
        eid: messageRequest.eid,
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.MESSAGE_CONFIRM,
        mid: messageRequest.mid,
        receipt,
      };

      const responseSent = await this.request(messageRequest);
      if (!responseSent) {
        const error: SparksChannel.Error.SendRequest = {
          eid: event.eid,
          type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
          message: 'failed to send message confirmation',
          cid: this.cid,
          timestamp: getTimestamp(),
        }
        this.request(error);
        return reject(error);
      }

      resolve();
    });
  }

  async onMessageConfirmed(messageConfirm: SparksChannel.Event.MessageConfirm) {
    const promise = this.messagePromises.get(messageConfirm.eid);
    if (!promise) return;

    const validReceipt = await this.verifyReceipt(messageConfirm);
    if (!validReceipt) {
      const error: SparksChannel.Error.ReceiptVerification = {
        eid: messageConfirm.eid,
        type: SparksChannel.Error.Types.RECEIPT_VERIFICATION_ERROR,
        message: 'receipt verification failed',
        cid: this.cid,
        timestamp: getTimestamp(),
      }
      this.request(error);
      promise.reject(error);
      this.messagePromises.delete(messageConfirm.eid);
      return;
    }

    await this.logReceipt(messageConfirm.receipt);
    this.messagePromises.delete(messageConfirm.eid);
    promise.resolve();
  }

  close() { }

  handleError(errorEvent: SparksChannel.Error.Any) {
    const promise = this.openingPromises.get(errorEvent.eid);
    if (!promise) return;
    promise.reject(errorEvent);
    this.openingPromises.delete(errorEvent.eid);
  }

  protected async request(event: SparksChannel.Event.Any | SparksChannel.Error.Any) {
    return this.requestHandler(event)
  }

  public sendRequests(callback: SparksChannel.RequestHandler) {
    this.requestHandler = callback;
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
      case SparksChannel.Error.Types.UNEXPECTED_ERROR:
        this.handleError(event);
        break;
    }
  }
}