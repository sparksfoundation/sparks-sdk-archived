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
  async sealData(data, event) {
    let error = null;
    const sharedKey = this.sharedKey;
    const encrypted = sharedKey ? await this.spark.encrypt({ sharedKey, data }) : null;
    const ciphertext = encrypted ? await this.spark.sign({ data: encrypted }) : null;
    if (!ciphertext) {
      error = {
        eid: event.eid,
        type: SparksChannel.Error.Types.CREATE_CIPHERTEXT_ERROR,
        message: "failed to create ciphertext",
        cid: this.cid,
        timestamp: getTimestamp()
      };
    }
    return { ciphertext, error };
  }
  async openCipher(receipt, event) {
    let error = null;
    const peer = this.peer;
    const sharedKey = this.sharedKey;
    const openedCipher = sharedKey ? await this.spark.verify({ signature: receipt, publicKey: peer.publicKeys.signing }) : null;
    const decryptedCipher = openedCipher ? await this.spark.decrypt({ sharedKey, data: openedCipher }) : null;
    if (!decryptedCipher) {
      error = {
        type: SparksChannel.Error.Types.OPEN_CIPHERTEXT_ERROR,
        eid: event.eid,
        message: "failed to open ciphertext",
        cid: this.cid,
        timestamp: getTimestamp()
      };
    }
    return { data: decryptedCipher, error };
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
  getPromise(event) {
    const promise = this.promises.get(event.eid);
    if (!promise) {
      const error = {
        eid: event.eid,
        type: SparksChannel.Error.Types.EVENT_PROMISE_ERROR,
        message: "missing event promise for event " + event.type,
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
      const type = event.type;
      const isError = Object.values(SparksChannel.Error.Types).includes(type);
      if (isError && this.errorHandler) {
        this.errorHandler({ error: event });
      }
      await this.requestHandler(event);
      this.eventLog.push({ response: true, ...event });
    } catch (err) {
      error = {
        eid: event.eid,
        type: SparksChannel.Error.Types.SEND_REQUEST_ERROR,
        message: err.message || "failed to send request",
        cid: this.cid,
        timestamp: getTimestamp()
      };
      this.eventLog.push({ response: true, ...error });
      if (this.errorHandler) {
        this.errorHandler({ error });
      }
    }
    return { error };
  }
  async handleResponse(event) {
    const isEvent = Object.values(SparksChannel.Event.Types).includes(event.type);
    const isError = Object.values(SparksChannel.Error.Types).includes(event.type);
    if (!isEvent && !isError)
      return;
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
      case (this.opened && type === SparksChannel.Event.Types.MESSAGE):
        return this.onMessage(event);
      case (!this.opened && type === SparksChannel.Event.Types.MESSAGE):
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
  handleResponseError(error) {
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
      const { error: sealError, ciphertext: receipt } = await this.sealData(receiptData, requestEvent);
      if (sealError) {
        const message = "error creating open accept receipt";
        this.request({ ...sealError, message });
        return reject({ ...sealError, message });
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
  async onOpenAccepted(acceptEvent) {
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
    const receiptData = {
      type: SparksChannel.Receipt.Types.OPEN_CONFIRMED,
      cid: this.cid,
      timestamp: getTimestamp(),
      peers: [
        { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
        { identifier: acceptEvent.identifier, publicKeys: acceptEvent.publicKeys }
      ]
    };
    const { ciphertext: receipt, error: sealError } = await this.sealData(receiptData, acceptEvent);
    if (sealError) {
      const message = "error creating open confirm receipt";
      this.request({ ...sealError, message });
      promise.reject({ ...sealError, message });
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
  async completeOpen(confirmOrAcceptEvent) {
    const { promise } = this.getPromise(confirmOrAcceptEvent);
    if (!promise)
      return;
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
  send(payload) {
    return new Promise(async (resolve, reject) => {
      if (!this.opened)
        return reject("Channel not opened");
      const encrypted = await this.spark.encrypt({ data: payload, sharedKey: this.sharedKey });
      const ciphertext = await this.spark.sign({ data: encrypted });
      const event = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.MESSAGE,
        mid: randomNonce(16),
        ciphertext
      };
      this.promises.set(event.eid, { resolve, reject });
      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.request(requestError);
        return reject(requestError);
      }
    });
  }
  async onMessage(messageEvent) {
    const { data, error } = await this.openCipher(messageEvent.ciphertext, messageEvent);
    if (error) {
      this.request({ ...error, message: "error decrypting message" });
      return;
    }
    console.log("message completing 0");
    const receiptData = {
      type: SparksChannel.Receipt.Types.MESSAGE_CONFIRMED,
      cid: this.cid,
      timestamp: getTimestamp(),
      mid: messageEvent.mid,
      data
    };
    const { ciphertext: receipt, error: receiptError } = await this.sealData(receiptData, messageEvent);
    if (receiptError) {
      this.request({ ...receiptError, message: "error creating message receipt" });
      return;
    }
    console.log("message completing 1");
    const event = {
      eid: messageEvent.eid,
      cid: this.cid,
      timestamp: getTimestamp(),
      type: SparksChannel.Event.Types.MESSAGE_CONFIRM,
      mid: messageEvent.mid,
      receipt
    };
    const { error: requestError } = await this.request(event);
    if (requestError) {
      this.request(requestError);
      return;
    }
    console.log("message completing 2");
    this.completeMessage(messageEvent, data);
  }
  async onMessageConfirmed(confirmEvent) {
    const { promise } = this.getPromise(confirmEvent);
    if (!promise)
      return;
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
  async completeMessage(messageRequestOrConfirm, data) {
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
  close() {
    return new Promise(async (resolve, reject) => {
      if (!this.opened)
        return reject("Channel already closed");
      const event = {
        eid: randomNonce(16),
        cid: this.cid,
        timestamp: getTimestamp(),
        type: SparksChannel.Event.Types.CLOSE
      };
      this.promises.set(event.eid, { resolve, reject });
      const { error: requestError } = await this.request(event);
      if (requestError) {
        this.request(requestError);
        return reject(requestError);
      }
    });
  }
  async onClose(requestEvent) {
    const receiptData = {
      type: SparksChannel.Receipt.Types.CLOSE_CONFIRMED,
      cid: this.cid,
      timestamp: getTimestamp()
    };
    const { ciphertext: receipt, error: receiptError } = await this.sealData(receiptData, requestEvent);
    if (receiptError) {
      this.request({ ...receiptError, message: "error creating close receipt" });
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
    const { promise } = this.getPromise(confirmEvent);
    if (!promise)
      return;
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
  completeClose(requestOrConfirmEvent) {
    this.opened = false;
    this.pendingMessages = [];
    this.promises.clear();
    this.peer = null;
    this.sharedKey = null;
    if (this.closeHandler) {
      this.closeHandler({ event: requestOrConfirmEvent });
    }
  }
  setRequestHandler(callback) {
    this.requestHandler = callback;
  }
  setMessageHandler(callback) {
    this.messageHandler = callback;
  }
  setOpenHandler(callback) {
    this.openHandler = callback;
  }
  setCloseHandler(callback) {
    this.closeHandler = callback;
  }
  setErrorHandler(callback) {
    this.errorHandler = callback;
  }
}
