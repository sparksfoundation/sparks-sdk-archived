import { SparksChannel } from "./types.mjs";
import { getTimestamp, randomNonce } from "../../utilities/index.mjs";
export class Channel {
  constructor({ spark, cid }) {
    this.promises = /* @__PURE__ */ new Map();
    this.pendingMessages = [];
    this.opened = false;
    this.eventLog = [];
    this.spark = spark;
    this.cid = cid || randomNonce(16);
    this.eventLog = [];
  }
  // utilities
  async sealReceipt(data, event) {
    let error = null;
    const sharedKey = this.sharedKey;
    const encrypted = sharedKey ? await this.spark.encrypt({ sharedKey, data }) : null;
    const receipt = encrypted ? await this.spark.sign({ data: encrypted }) : null;
    if (!receipt) {
      error = {
        eid: event.eid,
        type: SparksChannel.Error.Types.RECEIPT_CREATION_ERROR,
        message: "failed to create receipt",
        cid: this.cid,
        timestamp: getTimestamp()
      };
    }
    return { receipt, error };
  }
  async verifyReceipt(receipt, event) {
    let error = null;
    const peer = this.peer;
    const sharedKey = this.sharedKey;
    const openedReceipt = sharedKey ? await this.spark.verify({ signature: receipt, publicKey: peer.publicKeys.signing }) : null;
    const decryptedReceipt = openedReceipt ? await this.spark.decrypt({ sharedKey, data: openedReceipt }) : null;
    if (!decryptedReceipt) {
      error = {
        type: SparksChannel.Error.Types.RECEIPT_VERIFICATION_ERROR,
        eid: event.eid,
        message: "failed to verify receipt",
        cid: this.cid,
        timestamp: getTimestamp()
      };
    }
    return { valid: !!decryptedReceipt, error };
  }
  async setPeer(event) {
    let error = null;
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
          msg = "invalid identifier";
          break;
        case (!signing || !encryption):
          type = SparksChannel.Error.Types.INVALID_PUBLIC_KEYS;
          msg = "invalid public keys";
          break;
        case !pendingSharedKey:
          type = SparksChannel.Error.Types.COMPUTE_SHARED_KEY_ERROR;
          msg = "failed to compute shared key";
          break;
      }
      error = {
        type,
        eid: event.eid,
        message: msg,
        cid: this.cid,
        timestamp: getTimestamp()
      };
    }
    this.peer = { identifier, publicKeys };
    this.sharedKey = pendingSharedKey;
    return { error };
  }
  getPromise(eid) {
    const promise = this.promises.get(eid);
    if (!promise) {
      const error = {
        eid,
        type: SparksChannel.Error.Types.EVENT_PROMISE_ERROR,
        message: "missing event promise",
        cid: this.cid,
        timestamp: getTimestamp()
      };
      return { promise: null, error };
    }
    return { promise, error: null };
  }
  async request(event) {
    let error = null;
    try {
      await this.requestHandler(event);
      this.eventLog.push({ response: true, ...event });
    } catch (err) {
      error = {
        eid: event.eid,
        type: SparksChannel.Error.Types.UNEXPECTED_ERROR,
        message: "failed to send request",
        cid: this.cid,
        timestamp: getTimestamp()
      };
      this.eventLog.push({ response: true, ...error });
    }
    return { error };
  }
  handleResponses(event) {
    const isEvent = Object.values(SparksChannel.Event.Types).includes(event.type);
    const isError = Object.values(SparksChannel.Error.Types).includes(event.type);
    if (!isEvent && !isError)
      return;
    const type = isError ? SparksChannel.Error.Types.UNEXPECTED_ERROR : event.type;
    if (isEvent || isError) {
      this.eventLog.push({ request: true, ...event });
    }
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
        if (this.opened)
          this.onMessageRequest(event);
        else
          this.pendingMessages.push(event);
        break;
      case SparksChannel.Event.Types.MESSAGE_CONFIRM:
        this.onMessageConfirmed(event);
        break;
      case SparksChannel.Event.Types.CLOSE_REQUEST:
        this.onCloseRequested(event);
        break;
      case SparksChannel.Event.Types.CLOSE_CONFIRM:
        this.onCloseConfirmed(event);
        break;
      case SparksChannel.Error.Types.UNEXPECTED_ERROR:
        const { promise } = this.getPromise(event.eid);
        if (!promise)
          throw new Error(event);
        promise.reject(event);
        this.promises.delete(event.eid);
        break;
    }
  }
  // open flow
  onOpenRequested(requestEvent) {
    return new Promise(async (resolve, reject) => {
      const { error: setPeerError } = await this.setPeer(requestEvent);
      if (setPeerError) {
        this.request(setPeerError);
        return reject(setPeerError);
      }
      const receiptData = {
        type: SparksChannel.Receipt.Types.OPEN_ACCEPTED,
        cid: this.cid,
        timestamp: getTimestamp(),
        peers: [
          { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
          { identifier: this.peer.identifier, publicKeys: this.peer.publicKeys }
        ]
      };
      const { error: receiptError, receipt } = await this.sealReceipt(receiptData, requestEvent);
      if (receiptError) {
        this.request(receiptError);
        return reject(receiptError);
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
      this.promises.set(requestEvent.eid, { resolve, reject });
      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.promises.delete(requestEvent.eid);
        this.request(requestError);
        return reject(requestError);
      }
    });
  }
  async onOpenAccepted(acceptEvent) {
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
    const receiptData = {
      type: SparksChannel.Receipt.Types.OPEN_CONFIRMED,
      cid: this.cid,
      timestamp: getTimestamp(),
      peers: [
        { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
        { identifier: acceptEvent.identifier, publicKeys: acceptEvent.publicKeys }
      ]
    };
    const { receipt, error: receiptError } = await this.sealReceipt(receiptData, acceptEvent);
    if (receiptError) {
      this.request(receiptError);
      promise.reject(receiptError);
      this.promises.delete(acceptEvent.eid);
      return;
    }
    const event = {
      eid: acceptEvent.eid ? acceptEvent.eid : "",
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Event.Types.OPEN_CONFIRM,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
      receipt
    };
    const { error: requestError } = await this.request(event);
    if (requestError) {
      this.request(requestError);
      promise.reject(requestError);
      this.promises.delete(acceptEvent.eid);
      return;
    }
    this.completeOpen(acceptEvent);
  }
  async onOpenConfirmed(confirmEvent) {
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
  async completeOpen(confirmOrAcceptEvent) {
    const { promise } = this.getPromise(confirmOrAcceptEvent.eid);
    if (!promise)
      return;
    promise.resolve(confirmOrAcceptEvent);
    this.promises.delete(confirmOrAcceptEvent.eid);
    this.opened = true;
    this.pendingMessages.forEach((pendingMessage) => {
      this.onMessageRequest(pendingMessage);
    });
    this.pendingMessages = [];
  }
  // message flow
  async onMessageRequest(messageRequest) {
    const receiptData = {
      type: SparksChannel.Receipt.Types.MESSAGE_CONFIRMED,
      cid: this.cid,
      timestamp: getTimestamp(),
      mid: messageRequest.mid,
      payload: messageRequest.payload
    };
    const { receipt, error: receiptError } = await this.sealReceipt(receiptData, messageRequest);
    if (receiptError) {
      this.request(receiptError);
      return;
    }
    const event = {
      eid: messageRequest.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Event.Types.MESSAGE_CONFIRM,
      mid: messageRequest.mid,
      receipt
    };
    const { error: requestError } = await this.request(event);
    if (requestError) {
      this.request(requestError);
      return;
    }
  }
  async onMessageConfirmed(confirmEvent) {
    const { promise } = this.getPromise(confirmEvent.eid);
    if (!promise)
      return;
    const { error: validReceiptError } = await this.verifyReceipt(confirmEvent.receipt);
    if (validReceiptError) {
      this.request(validReceiptError);
      promise.reject(validReceiptError);
      this.promises.delete(confirmEvent.eid);
      return;
    }
    this.promises.delete(confirmEvent.eid);
    promise.resolve(confirmEvent);
    this.completeMessage(confirmEvent);
  }
  async completeMessage(messageRequestOrConfirm) {
    const { promise } = this.getPromise(messageRequestOrConfirm.eid);
    if (!promise)
      return;
    promise.resolve(messageRequestOrConfirm);
    this.promises.delete(messageRequestOrConfirm.eid);
  }
  // close flow
  async onCloseRequested(requestEvent) {
    const receiptData = {
      type: SparksChannel.Receipt.Types.CLOSE_CONFIRMED,
      cid: this.cid,
      timestamp: getTimestamp()
    };
    const { receipt, error: receiptError } = await this.sealReceipt(receiptData, requestEvent);
    if (receiptError) {
      this.request(receiptError);
      return;
    }
    const event = {
      eid: requestEvent.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Event.Types.CLOSE_CONFIRM,
      receipt
    };
    const { error: requestError } = await this.request(event);
    if (requestError) {
      this.request(requestError);
      return;
    }
    this.completeClose(requestEvent);
  }
  async onCloseConfirmed(confirmEvent) {
    const { promise } = this.getPromise(confirmEvent.eid);
    if (!promise)
      return;
    const { error: validReceiptError } = await this.verifyReceipt(confirmEvent.receipt);
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
  completeClose(requestOrConfirmEvent) {
    this.opened = false;
    this.pendingMessages = [];
    this.promises.clear();
    this.peer = null;
    this.sharedKey = null;
  }
  // public methods
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
      this.promises.set(event.eid, { resolve, reject });
      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.promises.delete(event.eid);
        return reject(requestError);
      }
    });
  }
  async acceptOpen(requestEvent) {
    this.eventLog.push({ request: true, requestEvent });
    return await this.onOpenRequested(requestEvent);
  }
  async rejectOpen(requestEvent) {
    const event = {
      eid: requestEvent.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Error.Types.OPEN_REQUEST_REJECTED,
      message: "Open request rejected"
    };
    await this.request(event);
  }
  send(payload) {
    return new Promise(async (resolve, reject) => {
      if (!this.opened)
        return reject("Channel not opened");
      const event = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.MESSAGE_REQUEST,
        mid: randomNonce(16),
        payload
      };
      this.promises.set(event.eid, { resolve, reject });
      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.request(requestError);
        return reject(requestError);
      }
    });
  }
  close() {
    return new Promise(async (resolve, reject) => {
      if (!this.opened)
        return reject("Channel already closed");
      const event = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.CLOSE_REQUEST
      };
      this.promises.set(event.eid, { resolve, reject });
      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.request(requestError);
        return reject(requestError);
      }
    });
  }
  setSendRequest(callback) {
    this.requestHandler = callback;
  }
}
