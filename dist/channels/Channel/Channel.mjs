import { SparksChannel } from "./types.mjs";
import { getTimestamp, randomNonce } from "../../utilities/index.mjs";
export class Channel {
  constructor({ spark, cid }) {
    this.openingPromises = /* @__PURE__ */ new Map();
    this.messagePromises = /* @__PURE__ */ new Map();
    this.spark = spark;
    this.cid = cid || randomNonce(16);
    this.receipts = [];
    this.peer = {
      identifier: null,
      publicKeys: null,
      sharedKey: null
    };
  }
  async logReceipt(receiptCipher) {
    const opened = await this.spark.verify({ signature: receiptCipher, publicKey: this.peer.publicKeys.signing });
    const decrypted = await this.spark.decrypt({ sharedKey: this.peer.sharedKey, data: opened });
    const receipt = {
      ...decrypted,
      ciphertext: receiptCipher
    };
    this.receipts.push(receipt);
  }
  async sealReceipt(data) {
    if (!this.peer.sharedKey)
      return null;
    const encrypted = await this.spark.encrypt({ sharedKey: this.peer.sharedKey, data });
    if (!encrypted)
      return null;
    const signature = await this.spark.sign({ data: encrypted });
    if (!signature)
      return null;
    return signature;
  }
  async verifyReceipt(event) {
    if (!this.peer.sharedKey)
      return false;
    const openedReceipt = await this.spark.verify({ signature: event.receipt, publicKey: event.publicKeys.signing });
    if (!openedReceipt)
      return false;
    const decryptedReceipt = await this.spark.decrypt({ sharedKey: this.peer.sharedKey, data: openedReceipt });
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
        type: SparksChannel.Event.Types.OPEN_REQUEST,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys
      };
      this.openingPromises.set(event.eid, { resolve, reject });
      const responseSent = await this.request(event);
      if (!responseSent) {
        this.openingPromises.delete(event.eid);
        const error = {
          eid: event.eid,
          type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
          message: "failed to send open request",
          cid: this.cid,
          timestamp: getTimestamp()
        };
        return reject(error);
      }
    });
  }
  async setPeer(event) {
    const sharedKey = await this.spark.computeSharedKey({ publicKey: event.publicKeys.encryption });
    const identifier = event.identifier;
    const publicKeys = event.publicKeys;
    this.peer = { identifier, publicKeys, sharedKey };
  }
  onOpenRequested(requestEvent) {
    return new Promise(async (resolve, reject) => {
      const receiptData = {
        type: SparksChannel.Receipt.Types.OPEN_CONFIRMED,
        cid: this.cid,
        timestamp: getTimestamp(),
        peers: [
          { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
          { identifier: requestEvent.identifier, publicKeys: requestEvent.publicKeys }
        ]
      };
      await this.setPeer(requestEvent);
      const receipt = await this.sealReceipt(receiptData);
      if (!receipt) {
        const error = {
          eid: requestEvent.eid,
          type: SparksChannel.Error.Types.RECEIPT_CREATION_ERROR,
          message: "failed to create receipt",
          cid: this.cid,
          timestamp: getTimestamp()
        };
        this.request(error);
        return reject(error);
      }
      const event = {
        eid: requestEvent.eid,
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.OPEN_ACCEPT,
        receipt,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys
      };
      this.openingPromises.set(requestEvent.eid, { resolve, reject });
      const responseSent = await this.request(event);
      if (!responseSent) {
        this.openingPromises.delete(requestEvent.eid);
        const error = {
          eid: requestEvent.eid,
          type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
          message: "failed to send open accept",
          cid: this.cid,
          timestamp: getTimestamp()
        };
        this.request(error);
        return reject(error);
      }
    });
  }
  async onOpenAccepted(acceptEvent) {
    if (!this.openingPromises.has(acceptEvent.eid)) {
      const error = {
        eid: acceptEvent.eid,
        type: SparksChannel.Error.Types.EVENT_PROMISE_ERROR,
        message: "missing event promise",
        cid: this.cid,
        timestamp: getTimestamp()
      };
      this.request(error);
      return;
    }
    await this.setPeer(acceptEvent);
    const promise = this.openingPromises.get(acceptEvent.eid);
    const validReceipt = await this.verifyReceipt(acceptEvent);
    if (!validReceipt) {
      const error = {
        eid: acceptEvent.eid,
        type: SparksChannel.Error.Types.RECEIPT_VERIFICATION_ERROR,
        message: "receipt verification failed",
        cid: this.cid,
        timestamp: getTimestamp()
      };
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
      return;
    }
    const receiptData = {
      type: SparksChannel.Receipt.Types.OPEN_CONFIRMED,
      cid: this.cid,
      timestamp: getTimestamp(),
      peers: [
        { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
        { identifier: acceptEvent.identifier, publicKeys: acceptEvent.publicKeys }
      ]
    };
    const receipt = await this.sealReceipt(receiptData);
    if (!receipt) {
      const error = {
        eid: acceptEvent.eid,
        type: SparksChannel.Error.Types.RECEIPT_CREATION_ERROR,
        message: "failed to create receipt",
        cid: this.cid,
        timestamp: getTimestamp()
      };
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(acceptEvent.eid);
      return;
    }
    const event = {
      eid: acceptEvent.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Event.Types.OPEN_CONFIRM,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
      receipt
    };
    const responseSent = await this.request(event);
    if (!responseSent) {
      const error = {
        eid: acceptEvent.eid,
        type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
        message: "failed to send open confirm",
        cid: this.cid,
        timestamp: getTimestamp()
      };
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
      const error = {
        eid: confirmEvent.eid,
        type: SparksChannel.Error.Types.RECEIPT_VERIFICATION_ERROR,
        message: "receipt verification failed",
        cid: this.cid,
        timestamp: getTimestamp()
      };
      this.request(error);
      this.openingPromises.get(confirmEvent.eid).reject(error);
      this.openingPromises.delete(confirmEvent.eid);
      return;
    }
    this.completeOpen(confirmEvent);
  }
  async completeOpen(data) {
    const promise = this.openingPromises.get(data.eid);
    if (!promise)
      return;
    const sharedKey = await this.spark.computeSharedKey({ publicKey: data.publicKeys.encryption });
    if (!sharedKey) {
      const error = {
        eid: data.eid,
        type: SparksChannel.Error.Types.SHARED_KEY_CREATION_ERROR,
        message: "failed to create shared key",
        cid: this.cid,
        timestamp: getTimestamp()
      };
      this.request(error);
      promise.reject(error);
      this.openingPromises.delete(data.eid);
      return;
    }
    this.peer = {
      identifier: data.identifier,
      publicKeys: data.publicKeys,
      sharedKey
    };
    await this.logReceipt(data.receipt);
    promise.resolve(this);
    this.openingPromises.delete(data.eid);
    console.log("event: OPEN_COMPLETE");
  }
  send(payload) {
    return new Promise(async (resolve, reject) => {
      const event = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.MESSAGE_REQUEST,
        mid: randomNonce(16),
        payload
      };
      this.messagePromises.set(event.eid, { resolve, reject });
      const responseSent = await this.request(event);
      if (!responseSent) {
        this.messagePromises.delete(event.eid);
        const error = {
          eid: event.eid,
          type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
          message: "failed to send message",
          cid: this.cid,
          timestamp: getTimestamp()
        };
        this.request(error);
        return reject(error);
      }
    });
  }
  onMessageRequest(messageRequest) {
    return new Promise(async (resolve, reject) => {
      const validReceipt = await this.verifyReceipt(messageRequest);
      if (!validReceipt) {
        const error = {
          eid: messageRequest.eid,
          type: SparksChannel.Error.Types.RECEIPT_VERIFICATION_ERROR,
          message: "receipt verification failed",
          cid: this.cid,
          timestamp: getTimestamp()
        };
        this.request(error);
        return reject(error);
      }
      const receiptData = {
        type: SparksChannel.Receipt.Types.MESSAGE_RECEIVED,
        cid: this.cid,
        timestamp: getTimestamp(),
        mid: messageRequest.mid,
        payload: messageRequest.payload
      };
      const receipt = await this.sealReceipt(receiptData);
      if (!receipt) {
        const error = {
          eid: messageRequest.eid,
          type: SparksChannel.Error.Types.RECEIPT_CREATION_ERROR,
          message: "failed to create message receipt",
          cid: this.cid,
          timestamp: getTimestamp()
        };
        this.request(error);
        return reject(error);
      }
      const event = {
        eid: messageRequest.eid,
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.MESSAGE_CONFIRM,
        mid: messageRequest.mid,
        receipt
      };
      const responseSent = await this.request(messageRequest);
      if (!responseSent) {
        const error = {
          eid: event.eid,
          type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
          message: "failed to send message confirmation",
          cid: this.cid,
          timestamp: getTimestamp()
        };
        this.request(error);
        return reject(error);
      }
      resolve();
    });
  }
  async onMessageConfirmed(messageConfirm) {
    const promise = this.messagePromises.get(messageConfirm.eid);
    if (!promise)
      return;
    const validReceipt = await this.verifyReceipt(messageConfirm);
    if (!validReceipt) {
      const error = {
        eid: messageConfirm.eid,
        type: SparksChannel.Error.Types.RECEIPT_VERIFICATION_ERROR,
        message: "receipt verification failed",
        cid: this.cid,
        timestamp: getTimestamp()
      };
      this.request(error);
      promise.reject(error);
      this.messagePromises.delete(messageConfirm.eid);
      return;
    }
    await this.logReceipt(messageConfirm.receipt);
    this.messagePromises.delete(messageConfirm.eid);
    promise.resolve();
  }
  close() {
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
