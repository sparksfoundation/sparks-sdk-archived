import { SharedEncryptionKey } from "../../ciphers";
import { Identifier, PublicKeys } from "../../controllers";
import { SparksChannel } from "./types";
import { getTimestamp, randomNonce } from "../../utilities";
import { ISpark } from "../../Spark";

export interface IChannel {}

export class Channel implements IChannel {
  private openingPromises: Map<string, { resolve, reject }> = new Map();
  private openingSharedKeys: Map<string, SharedEncryptionKey> = new Map();
  private requestHandler: (event) => Promise<{ ok }>;
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
  }

  private channelError({ eid, type, message }: { eid: SparksChannel.Eid, type: SparksChannel.ErrorTypes, message: SparksChannel.ErrorMessage }) {
    const event: SparksChannel.Errors[typeof type] = {
      type: type,
      cid: this.cid,
      eid: eid || randomNonce(16),
      timestamp: getTimestamp(),
      message,
    };
    return event;
  }

  private async getSharedKey({ eid, publicKey }) {
    let sharedKey = this.openingSharedKeys.get(eid);
    if (!sharedKey) {
      sharedKey = await this.spark.computeSharedKey({ publicKey });
      if (sharedKey) this.openingSharedKeys.set(eid, sharedKey);
    }
    return sharedKey;
  }

  private async channelReceipt(type: SparksChannel.ReceiptTypes, event: SparksChannel.OpenRequestEvent | SparksChannel.OpenAcceptEvent): Promise<string | null> {
    const receipt: SparksChannel.Receipts[typeof type] = {
      type: type,
      cid: this.cid,
      timestamp: getTimestamp(),
      peers: [
        { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
        { identifier: event.identifier, publicKeys: event.publicKeys },
      ]
    };

    const sharedKey = await this.getSharedKey({ eid: event.eid, publicKey: event.publicKeys.encryption });
    if (!sharedKey) return null;

    const encryptedReceipt = await this.spark.encrypt({ sharedKey, data: receipt });
    if (!encryptedReceipt) return null;

    const signedEncryptedReceipt = await this.spark.sign({ data: encryptedReceipt });
    if (!signedEncryptedReceipt) return null;

    return signedEncryptedReceipt;
  }

  private async verifyReceipt(event) {
    const sharedKey = await this.getSharedKey({ eid: event.eid, publicKey: event.publicKeys.encryption });
    if (!sharedKey) return false;

    const openedReceipt = await this.spark.verify({ signature: event.receipt, publicKey: event.publicKeys.signing });
    if (!openedReceipt) return false;

    const decryptedReceipt = await this.spark.decrypt({ sharedKey, data: openedReceipt });
    if (!decryptedReceipt) return false;

    return true;
  }

  open() {
    return new Promise(async (resolve, reject) => {
      const event: SparksChannel.OpenRequestEvent = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.EventTypes.OPEN_REQUEST,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys,
      };

      console.log('firs', event.eid)
      this.openingPromises.set(event.eid, { resolve, reject });
      const responseSent = await this.request(event);

      if (!responseSent) {
        this.openingPromises.delete(event.eid);
        const error: SparksChannel.Error = this.channelError({
          eid: event.eid,
          type: SparksChannel.ErrorTypes.OPEN_REQUEST_FAILED,
          message: 'failed to send open request'
        });
        return reject(error);
      }
    });
  }

  onOpenRequested(requestEvent: SparksChannel.OpenRequestEvent) {
    return new Promise(async (resolve, reject) => {
      const receipt = await this.channelReceipt(SparksChannel.ReceiptTypes.OPEN_CONFIRMED, requestEvent)
      if (!receipt) {
        const error: SparksChannel.Error = this.channelError({
          eid: requestEvent.eid,
          type: SparksChannel.ErrorTypes.RECEIPT_CREATION_FAILED,
          message: 'failed to create receipt'
        });
        this.request(error);
        return reject(error);
      }

      const event: SparksChannel.OpenAcceptEvent = {
        eid: requestEvent.eid,
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.EventTypes.OPEN_ACCEPT,
        receipt,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys,
      };
      const responseSent = await this.request(event);

      if (!responseSent) {
        const error: SparksChannel.Error = this.channelError({
          eid: requestEvent.eid,
          type: SparksChannel.ErrorTypes.OPEN_ACCEPT_FAILED,
          message: 'failed to send open accept'
        });
        this.request(error);
        return reject(error);
      }

      this.openingPromises.set(requestEvent.eid, { resolve, reject });
    });
  }

  async onOpenAccepted(acceptEvent: SparksChannel.OpenAcceptEvent) {
    if (!this.openingPromises.has(acceptEvent.eid)) {
      const error: SparksChannel.Error = this.channelError({
        eid: acceptEvent.eid,
        type: SparksChannel.ErrorTypes.OPEN_ACCEPT_FAILED,
        message: 'failed to resolve accept promise'
      });
      this.request(error);
      return;
    }

    const promise = this.openingPromises.get(acceptEvent.eid);
    const validReceipt = await this.verifyReceipt(acceptEvent);
    if (!validReceipt) {
      const error: SparksChannel.Error = this.channelError({
        eid: acceptEvent.eid,
        type: SparksChannel.ErrorTypes.RECEIPT_VERIFICATION_FAILED,
        message: 'receipt verification failed'
      });
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
      return;
    }

    const receipt = await this.channelReceipt(SparksChannel.ReceiptTypes.OPEN_CONFIRMED, acceptEvent);
    if (!receipt) {
      const error: SparksChannel.Error = this.channelError({
        eid: acceptEvent.eid,
        type: SparksChannel.ErrorTypes.RECEIPT_CREATION_FAILED,
        message: 'failed to create receipt'
      });
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
      return;
    }

    const event: SparksChannel.OpenConfirmEvent = {
      eid: acceptEvent.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.EventTypes.OPEN_CONFIRM,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
      receipt,
    };

    const responseSent = await this.request(event);
    if (!responseSent) {
      const error: SparksChannel.Error = this.channelError({
        eid: acceptEvent.eid,
        type: SparksChannel.ErrorTypes.OPEN_CONFIRM_FAILED,
        message: 'failed to send open confirm'
      });
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
      return
    }

    this.completeOpen(acceptEvent);
  }

  async onOpenConfirmed(confirmEvent: SparksChannel.OpenConfirmEvent) {
    const validReceipt = await this.verifyReceipt(confirmEvent);
    if (!validReceipt) {
      const error: SparksChannel.Error = this.channelError({
        eid: confirmEvent.eid,
        type: SparksChannel.ErrorTypes.RECEIPT_VERIFICATION_FAILED,
        message: 'receipt verification failed'
      });
      this.request(error);
      this.openingPromises.get(confirmEvent.eid).reject(error);
      this.openingPromises.delete(confirmEvent.eid);
      return;
    }

    this.completeOpen(confirmEvent);
  }

  async completeOpen(data: any) {
    console.log('event: OPEN_COMPLETE')
    const promise = this.openingPromises.get(data.eid);
    if (!promise) return;
    this.peer = {
      identifier: data.identifier,
      publicKeys: data.publicKeys,
      sharedKey: data.sharedKey,
    }
    this.receipts.push(data.receipt);
    promise.resolve(this);
    this.openingPromises.delete(data.eid);
  }

  close() {}
  send(args:any) {}

  handleError(errorEvent) {
    const promise = this.openingPromises.get(errorEvent.eid);
    if (!promise) return;
    promise.reject(errorEvent);
    this.openingPromises.delete(errorEvent.eid);
  }

  protected async request(event) {
    return this.requestHandler(event)
  }

  public sendRequests(callback) {
    this.requestHandler = callback;
  }

  public handleResponses(event) {
    let type = event.type;
    console.log('event: ' + type)
    type = Object.values(SparksChannel.ErrorTypes).includes(type) ? SparksChannel.ErrorTypes.CHANNEL_ERROR : type;
    switch (type) {
      case SparksChannel.EventTypes.OPEN_REQUEST:
        this.onOpenRequested(event);
        break;
      case SparksChannel.EventTypes.OPEN_ACCEPT:
        this.onOpenAccepted(event);
        break;
      case SparksChannel.EventTypes.OPEN_CONFIRM:
        this.onOpenConfirmed(event);
        break;
      case SparksChannel.ErrorTypes.CHANNEL_ERROR:
        this.handleError(event);
        break;
    }
  }
}