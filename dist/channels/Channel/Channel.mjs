import { SparksChannel } from "./types.mjs";
import { getTimestamp, randomNonce } from "../../utilities/index.mjs";
export class Channel {
  constructor({ spark, cid }) {
    this.openingPromises = /* @__PURE__ */ new Map();
    this.openingSharedKeys = /* @__PURE__ */ new Map();
    this.spark = spark;
    this.cid = cid || randomNonce(16);
    this.receipts = [];
  }
  channelError({ eid, type, message }) {
    const event = {
      type,
      cid: this.cid,
      eid: eid || randomNonce(16),
      timestamp: getTimestamp(),
      message
    };
    return event;
  }
  async getSharedKey({ eid, publicKey }) {
    let sharedKey = this.openingSharedKeys.get(eid);
    if (!sharedKey) {
      sharedKey = await this.spark.computeSharedKey({ publicKey });
      if (sharedKey)
        this.openingSharedKeys.set(eid, sharedKey);
    }
    return sharedKey;
  }
  async channelReceipt(type, event) {
    const receipt = {
      type,
      cid: this.cid,
      timestamp: getTimestamp(),
      peers: [
        { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
        { identifier: event.identifier, publicKeys: event.publicKeys }
      ]
    };
    const sharedKey = await this.getSharedKey({ eid: event.eid, publicKey: event.publicKeys.encryption });
    if (!sharedKey)
      return null;
    const encryptedReceipt = await this.spark.encrypt({ sharedKey, data: receipt });
    if (!encryptedReceipt)
      return null;
    const signedEncryptedReceipt = await this.spark.sign({ data: encryptedReceipt });
    if (!signedEncryptedReceipt)
      return null;
    return signedEncryptedReceipt;
  }
  async verifyReceipt(event) {
    const sharedKey = await this.getSharedKey({ eid: event.eid, publicKey: event.publicKeys.encryption });
    if (!sharedKey)
      return false;
    const openedReceipt = await this.spark.verify({ signature: event.receipt, publicKey: event.publicKeys.signing });
    if (!openedReceipt)
      return false;
    const decryptedReceipt = await this.spark.decrypt({ sharedKey, data: openedReceipt });
    if (!decryptedReceipt)
      return false;
    return true;
  }
  open() {
    return new Promise(async (resolve, reject) => {
      const event = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.EventTypes.OPEN_REQUEST,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys
      };
      console.log("firs", event.eid);
      this.openingPromises.set(event.eid, { resolve, reject });
      const responseSent = await this.request(event);
      if (!responseSent) {
        this.openingPromises.delete(event.eid);
        const error = this.channelError({
          eid: event.eid,
          type: SparksChannel.ErrorTypes.OPEN_REQUEST_FAILED,
          message: "failed to send open request"
        });
        return reject(error);
      }
    });
  }
  onOpenRequested(requestEvent) {
    return new Promise(async (resolve, reject) => {
      const receipt = await this.channelReceipt(SparksChannel.ReceiptTypes.OPEN_CONFIRMED, requestEvent);
      if (!receipt) {
        const error = this.channelError({
          eid: requestEvent.eid,
          type: SparksChannel.ErrorTypes.RECEIPT_CREATION_FAILED,
          message: "failed to create receipt"
        });
        this.request(error);
        return reject(error);
      }
      const event = {
        eid: requestEvent.eid,
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.EventTypes.OPEN_ACCEPT,
        receipt,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys
      };
      const responseSent = await this.request(event);
      if (!responseSent) {
        const error = this.channelError({
          eid: requestEvent.eid,
          type: SparksChannel.ErrorTypes.OPEN_ACCEPT_FAILED,
          message: "failed to send open accept"
        });
        this.request(error);
        return reject(error);
      }
      this.openingPromises.set(requestEvent.eid, { resolve, reject });
    });
  }
  async onOpenAccepted(acceptEvent) {
    if (!this.openingPromises.has(acceptEvent.eid)) {
      const error = this.channelError({
        eid: acceptEvent.eid,
        type: SparksChannel.ErrorTypes.OPEN_ACCEPT_FAILED,
        message: "failed to resolve accept promise"
      });
      this.request(error);
      return;
    }
    const promise = this.openingPromises.get(acceptEvent.eid);
    const validReceipt = await this.verifyReceipt(acceptEvent);
    if (!validReceipt) {
      const error = this.channelError({
        eid: acceptEvent.eid,
        type: SparksChannel.ErrorTypes.RECEIPT_VERIFICATION_FAILED,
        message: "receipt verification failed"
      });
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
      return;
    }
    const receipt = await this.channelReceipt(SparksChannel.ReceiptTypes.OPEN_CONFIRMED, acceptEvent);
    if (!receipt) {
      const error = this.channelError({
        eid: acceptEvent.eid,
        type: SparksChannel.ErrorTypes.RECEIPT_CREATION_FAILED,
        message: "failed to create receipt"
      });
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
      return;
    }
    const event = {
      eid: acceptEvent.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.EventTypes.OPEN_CONFIRM,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
      receipt
    };
    const responseSent = await this.request(event);
    if (!responseSent) {
      const error = this.channelError({
        eid: acceptEvent.eid,
        type: SparksChannel.ErrorTypes.OPEN_CONFIRM_FAILED,
        message: "failed to send open confirm"
      });
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
      return;
    }
    this.completeOpen(acceptEvent);
  }
  async onOpenConfirmed(confirmEvent) {
    const validReceipt = await this.verifyReceipt(confirmEvent);
    if (!validReceipt) {
      const error = this.channelError({
        eid: confirmEvent.eid,
        type: SparksChannel.ErrorTypes.RECEIPT_VERIFICATION_FAILED,
        message: "receipt verification failed"
      });
      this.request(error);
      this.openingPromises.get(confirmEvent.eid).reject(error);
      this.openingPromises.delete(confirmEvent.eid);
      return;
    }
    this.completeOpen(confirmEvent);
  }
  async completeOpen(data) {
    console.log("event: OPEN_COMPLETE");
    const promise = this.openingPromises.get(data.eid);
    if (!promise)
      return;
    this.peer = {
      identifier: data.identifier,
      publicKeys: data.publicKeys,
      sharedKey: data.sharedKey
    };
    this.receipts.push(data.receipt);
    promise.resolve(this);
    this.openingPromises.delete(data.eid);
  }
  close() {
  }
  send(args) {
  }
  handleError(errorEvent) {
    const promise = this.openingPromises.get(errorEvent.eid);
    if (!promise)
      return;
    promise.reject(errorEvent);
    this.openingPromises.delete(errorEvent.eid);
  }
  async request(event) {
    return this.requestHandler(event);
  }
  sendRequests(callback) {
    this.requestHandler = callback;
  }
  handleResponses(event) {
    let type = event.type;
    console.log("event: " + type);
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
