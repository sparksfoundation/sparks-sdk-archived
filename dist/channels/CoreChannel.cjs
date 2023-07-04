"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreChannel = void 0;
var _cuid = _interopRequireDefault(require("cuid"));
var _utilities = require("../utilities/index.cjs");
var _types = require("./types.cjs");
var _channel = require("../errors/channel.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class CoreChannel {
  constructor({
    cid,
    spark,
    eventLog,
    peer
  }) {
    // opens and resolves/rejects on both sides
    this._openPromises = /* @__PURE__ */new Map();
    // opens and resolves/rejects only on initiator side
    this._closePromises = /* @__PURE__ */new Map();
    this._messagePromises = /* @__PURE__ */new Map();
    // PUBLIC EVENT HANDLING
    this._listeners = /* @__PURE__ */new Map();
    /**
     * PUBLIC CHANNEL METHODS
     * - can be be extended by child classes if needed
     * - should be exposed to user and called directly
     */
    /**
     * @description Sets event listeners for close, message or error events
     * @returns {Function} - a function to remove the listener
     * @throws {INVALID_CALLBACK_EVENT_TYPE}
     */
    this.on = (events, callback, options) => {
      const _events = Array.isArray(events) ? events : [events];
      const subscriptions = /* @__PURE__ */new Map();
      const removeListeners = () => {
        _events.forEach(event => {
          const unsubscribe = subscriptions.get(event);
          if (unsubscribe) unsubscribe();
        });
      };
      _events.forEach(event => {
        if (!Object.values(_types.ChannelEventType).includes(event)) {
          throw new Error("Invalid callback event type");
        }
        const _callback = options?.once ? event2 => {
          callback(event2);
          removeListeners();
        } : callback;
        if (!this._listeners.has(event)) this._listeners.set(event, /* @__PURE__ */new Map());
        this._listeners.get(event).set(_callback, _callback);
        const unsubscribe = () => {
          const eventCallbacks = this._listeners.get(event);
          eventCallbacks.delete(_callback);
        };
        subscriptions.set(event, unsubscribe);
      });
      return removeListeners;
    };
    this.off = callback => {
      if (!callback) {
        this._listeners.forEach(eventCallbacks => {
          eventCallbacks.clear();
        });
        return;
      } else {
        this._listeners.forEach(eventCallbacks => {
          if (!eventCallbacks.has(callback)) return;
          eventCallbacks.delete(callback);
        });
      }
    };
    /**
     * PROTECTED METHODS
     * - handleOpenRequested - to be set by extending class (does not call super)
     * - handleOpenAccepted - to be set by extending class (does not call super)
     * - handleResponse - must be overridden and/or called by extending class to handle inbound channel events
     * - handleClosed - optionally overridden by extending class to handle cleanup after channel is closed
     * - handleOpened - optionally overridden by extending class to handle setup after channel is opened
     * - import - must be overridden by extending class to import channel data
     * - export - must be overridden by extending class to export channel data
     */
    /**
    * @description Handles inbound channel open requests
    * - to be overridden by user via extending classes
    * - if not overridden, will resolve the request
    * - resolving triggers _acceptOpen
    * - rejecting triggers _rejectOpen
    */
    this.handleOpenRequested = ({
      event,
      resolve,
      reject
    }) => {
      return resolve();
    };
    /**
     * @description Handles inbound channel open acceptances
     * - to be overridden by user via extending classes
     * - if not overridden, will resolve the acceptance
     * - resolving triggers _confirmOpen
     * - rejecting triggers _rejectOpen
     */
    this.handleOpenAccepted = ({
      event,
      resolve,
      reject
    }) => {
      return resolve();
    };
    this._spark = spark;
    this._cid = cid || (0, _cuid.default)();
    this._eventLog = eventLog || [];
    this._status = _types.ChannelState.CLOSED;
    this._peer = peer || null;
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.message = this.message.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
  }
  get type() {
    const prototype = Object.getPrototypeOf(this);
    return prototype.constructor.type;
  }
  get cid() {
    return this._cid;
  }
  get peer() {
    return this._peer;
  }
  get sharedKey() {
    return this._sharedKey;
  }
  get status() {
    return this._status;
  }
  get eventLog() {
    return this._eventLog;
  }
  /**
   * PRIVATE UTILITY METHODS
   */
  async _createReceiptDigest(type, prev) {
    try {
      const {
        data = {},
        metadata = {}
      } = prev || {};
      const ourInfo = {
        identifier: this._spark.identifier,
        publicKeys: this._spark.publicKeys
      };
      const theirInfo = {
        identifier: data?.identifier,
        publicKeys: data?.publicKeys
      };
      const sharedKey = this._sharedKey;
      const eventEncrypted = await this._spark.encrypt({
        data: prev,
        sharedKey
      });
      const eventSealed = await this._spark.seal({
        data: eventEncrypted
      });
      let receipt;
      switch (prev.type) {
        case _types.ChannelEventType.OPEN_REQUEST:
          receipt = {
            type: _types.ChannelReceiptType.OPEN_ACCEPTED,
            peers: [ourInfo, theirInfo],
            eventDigest: eventSealed
          };
          break;
        case _types.ChannelEventType.OPEN_ACCEPTANCE:
          receipt = {
            type: _types.ChannelReceiptType.OPEN_CONFIRMED,
            peers: [ourInfo, theirInfo],
            eventDigest: eventSealed
          };
          break;
        case _types.ChannelEventType.CLOSE:
          receipt = {
            type: _types.ChannelReceiptType.CLOSE_CONFIRMED,
            eventDigest: eventSealed
          };
          break;
        case _types.ChannelEventType.MESSAGE:
          receipt = {
            type: _types.ChannelReceiptType.MESSAGE_RECEIVED,
            messageDigest: await this._createMessageDigest(data),
            eventDigest: eventSealed
          };
          break;
        default:
          return null;
      }
      if (!receipt) throw new Error("Receipt could not be generated");
      const receiptEncrypted = await this._spark.encrypt({
        data: receipt,
        sharedKey
      });
      const sealedReceiptDigest = await this._spark.seal({
        data: receiptEncrypted
      });
      return sealedReceiptDigest;
    } catch (error) {
      error.metadata = {
        receipt: type
      };
      const sparkError = _channel.ChannelErrors.CreateReceiptDigestError(error);
      return Promise.reject(sparkError);
    }
  }
  async _openReceiptDigest(type, receipDigest) {
    try {
      const sharedKey = this._sharedKey;
      const publicKey = this._peer.publicKeys.signer;
      const receiptEncrypted = await this._spark.open({
        signature: receipDigest,
        publicKey
      });
      const receipt = await this._spark.decrypt({
        data: receiptEncrypted,
        sharedKey
      });
      return receipt;
    } catch (error) {
      error.metadata = {
        receipt: type
      };
      const sparkError = _channel.ChannelErrors.CreateReceiptDigestError(error);
      return Promise.reject(sparkError);
    }
  }
  async _createMessageDigest(data) {
    try {
      const sharedKey = this._sharedKey;
      const messageEncrypted = await this._spark.encrypt({
        data,
        sharedKey
      });
      const messageSealed = await this._spark.seal({
        data: messageEncrypted
      });
      return messageSealed;
    } catch (error) {
      const sparkError = _channel.ChannelErrors.CreateMessageDigestError(error);
      return Promise.reject(sparkError);
    }
  }
  async _openMessageDigest(messageDigest) {
    try {
      const sharedKey = this._sharedKey;
      const messageEncrypted = await this._spark.open({
        signature: messageDigest,
        publicKey: this._peer.publicKeys.signer
      });
      const message = await this._spark.decrypt({
        data: messageEncrypted,
        sharedKey
      });
      return message;
    } catch (error) {
      const sparkError = _channel.ChannelErrors.OpenMessageDigestError(error);
      return Promise.reject(sparkError);
    }
  }
  async _createEvent(type, event) {
    try {
      const {
        data = {},
        metadata = {}
      } = event || {};
      const cid = this.cid;
      const eid = this._eventLog.length ? this._eventLog[this._eventLog.length - 1]?.metadata?.eid : _cuid.default.slug();
      const nid = _cuid.default.slug();
      const mid = metadata?.mid || _cuid.default.slug();
      const timestamp = (0, _utilities.utcEpochTimestamp)();
      const ourInfo = {
        identifier: this._spark.identifier,
        publicKeys: this._spark.publicKeys
      };
      switch (type) {
        case _types.ChannelEventType.OPEN_REQUEST:
          return {
            type: _types.ChannelEventType.OPEN_REQUEST,
            timestamp,
            data: {
              identifier: ourInfo.identifier,
              publicKeys: ourInfo.publicKeys
            },
            metadata: {
              eid,
              cid,
              nid
            }
          };
        case _types.ChannelEventType.OPEN_ACCEPTANCE:
          return {
            type: _types.ChannelEventType.OPEN_ACCEPTANCE,
            timestamp,
            data: {
              identifier: ourInfo.identifier,
              publicKeys: ourInfo.publicKeys,
              receipt: await this._createReceiptDigest(_types.ChannelReceiptType.OPEN_ACCEPTED, event)
            },
            metadata: {
              eid,
              cid,
              nid
            }
          };
        case _types.ChannelEventType.OPEN_CONFIRMATION:
          return {
            type: _types.ChannelEventType.OPEN_CONFIRMATION,
            timestamp,
            data: {
              receipt: await this._createReceiptDigest(_types.ChannelReceiptType.OPEN_CONFIRMED, event)
            },
            metadata: {
              eid,
              cid,
              nid
            }
          };
        case _types.ChannelEventType.OPEN_REJECTION:
          return {
            type: _types.ChannelEventType.OPEN_REJECTION,
            timestamp,
            data: {},
            metadata: {
              eid,
              cid,
              nid
            }
          };
        case _types.ChannelEventType.CLOSE:
          return {
            type: _types.ChannelEventType.CLOSE,
            timestamp,
            data: {},
            metadata: {
              eid,
              cid,
              nid
            }
          };
        case _types.ChannelEventType.CLOSE_CONFIRMATION:
          return {
            type: _types.ChannelEventType.CLOSE_CONFIRMATION,
            timestamp,
            data: {
              receipt: await this._createReceiptDigest(_types.ChannelReceiptType.CLOSE_CONFIRMED, event)
            },
            metadata: {
              eid,
              cid,
              nid
            }
          };
        case _types.ChannelEventType.MESSAGE:
          return {
            type: _types.ChannelEventType.MESSAGE,
            timestamp,
            data: await this._createMessageDigest(data),
            metadata: {
              eid,
              cid,
              nid,
              mid
            }
          };
        case _types.ChannelEventType.MESSAGE_CONFIRMATION:
          return {
            type: _types.ChannelEventType.MESSAGE_CONFIRMATION,
            timestamp,
            data: {
              receipt: await this._createReceiptDigest(_types.ChannelReceiptType.MESSAGE_RECEIVED, event)
            },
            metadata: {
              eid,
              cid,
              nid,
              mid
            }
          };
        case _types.ChannelEventType.ERROR:
          return {
            type: _types.ChannelEventType.ERROR,
            timestamp,
            data,
            metadata: {
              eid,
              cid,
              nid
            }
          };
        default:
          throw new Error("Invalid event type");
      }
    } catch (error) {
      error.metadata = {
        event: type
      };
      const sparkError = _channel.ChannelErrors.CreateEventError(error);
      return Promise.reject(sparkError);
    }
  }
  async _setPeer(event) {
    try {
      const {
        data
      } = event;
      const {
        identifier,
        publicKeys
      } = data || {};
      const {
        cipher,
        signer
      } = publicKeys || {};
      if (!identifier || !cipher || !signer) throw new Error("Invalid peer data");
      this._peer = {
        identifier: data.identifier,
        publicKeys: data.publicKeys
      };
      const sharedKey = await this._spark.generateCipherSharedKey({
        publicKey: cipher
      });
      this._sharedKey = sharedKey;
    } catch (error) {
      error.metadata = {
        event
      };
      const sparkError = _channel.ChannelErrors.SetPeerError(error);
      return Promise.reject(sparkError);
    }
  }
  /**
   * @description Initiates opening a channel
   * - sets a promise to be 
   *   - resolved w/open confirmation event
   *   - rejected w/open rejection event
   * - creates an open request event and sends it to the peer
   * @throws {OPEN_REQUEST_ERROR}
   * @returns {Promise<ChannelOpenConfirmationEvent>}
   */
  async open() {
    return new Promise(async (_resolve, _reject) => {
      try {
        if (this._status !== _types.ChannelState.CLOSED) {
          throw new Error("Channel is not closed");
        }
        this._status = _types.ChannelState.PENDING;
        const resolve = _resolve;
        const reject = _reject;
        this._openPromises.set(this.cid, {
          resolve,
          reject
        });
        const event = await this._createEvent(_types.ChannelEventType.OPEN_REQUEST, null);
        this._sendRequest(event);
      } catch (error) {
        this._openPromises.delete(this.cid);
        return _reject(_channel.ChannelErrors.OpenRequestError(error));
      }
    });
  }
  close() {
    return new Promise(async (_resolve, _reject) => {
      try {
        const resolve = _resolve;
        const reject = _reject;
        this._closePromises.set(this.cid, {
          resolve,
          reject
        });
        const event = await this._createEvent(_types.ChannelEventType.CLOSE, null);
        this._sendRequest(event);
      } catch (error) {
        this._closePromises.delete(this.cid);
        return _reject(_channel.ChannelErrors.OpenRequestError(error));
      }
    });
  }
  message(data) {
    return new Promise(async (_resolve, _reject) => {
      try {
        if (this._status !== _types.ChannelState.OPENED) {
          throw new Error("Channel is not open");
        }
        const resolve = _resolve;
        const reject = _reject;
        const event = await this._createEvent(_types.ChannelEventType.MESSAGE, {
          data
        });
        this._messagePromises.set(event.metadata.mid, {
          resolve,
          reject
        });
        this._sendRequest(event);
      } catch (error) {
        return _reject(_channel.ChannelErrors.MessageSendingError(error));
      }
    });
  }
  async getLoggedEventMessage(event) {
    try {
      const publicKey = event.request ? this._spark.publicKeys.signer : this._peer.publicKeys.signer;
      const sharedKey = this._sharedKey;
      switch (event.type) {
        case _types.ChannelEventType.MESSAGE:
          const opened = await this._spark.open({
            signature: event.data,
            publicKey
          });
          const decrypted = await this._spark.decrypt({
            data: opened,
            sharedKey
          });
          return Promise.resolve(decrypted);
        case _types.ChannelEventType.MESSAGE_CONFIRMATION:
          const openedReceipt = await this._spark.open({
            signature: event.data.receipt,
            publicKey
          });
          const decryptedReceipt = await this._spark.decrypt({
            data: openedReceipt,
            sharedKey
          });
          const openedMsg = await this._spark.open({
            signature: decryptedReceipt.messageDigest,
            publicKey
          });
          const decryptedMsg = await this._spark.decrypt({
            data: openedMsg,
            sharedKey
          });
          return Promise.resolve(decryptedMsg);
      }
    } catch (error) {
      error.metadata = {
        event: event.type,
        message: error.message
      };
      const sparkError = _channel.ChannelErrors.GetEventMessageError(error);
      return Promise.reject(sparkError);
    }
  }
  /**
   * PRIVATE CHANNEL METHODS
   * - should not be extended by child classes
   * - should not be exposed to user
   * - should not be called directly
   */
  /**
   * @description Handles inbound channel open requests
   * - sets up callbacks and passes data to handleOpenRequested
   * @param {ChannelOpenAcceptanceEvent} acceptanceEvent
   * @throws {ON_OPEN_REQUESTED_ERROR}
   */
  _onOpenRequested(requestEvent) {
    try {
      this.handleOpenRequested({
        event: requestEvent,
        resolve: this._acceptOpen.bind(this, requestEvent),
        reject: this._rejectOpen.bind(this, requestEvent)
      });
    } catch (error) {
      const sparkError = _channel.ChannelErrors.OnOpenRequestedError(error);
      return Promise.reject(sparkError);
    }
  }
  /**
   * @description Handles accepting an inbound channel open request
   * - sets the channel's peer and shared key
   * - creates an open acceptance event and sends it to the peer
   * @param {ChannelOpenRequestEvent} requestEvent
   * @returns {Promise<void>}
   * @throws {CONFIRM_OPEN_ERROR}
   */
  async _acceptOpen(requestEvent) {
    return new Promise(async (_resolve, _reject) => {
      try {
        await this._setPeer(requestEvent);
        const resolve = _resolve;
        const reject = _reject;
        this._openPromises.set(this.cid, {
          resolve,
          reject
        });
        const event = await this._createEvent(_types.ChannelEventType.OPEN_ACCEPTANCE, requestEvent);
        this._sendRequest(event);
      } catch (error) {
        const promise = this._openPromises.get(this.cid);
        const sparkError = _channel.ChannelErrors.OnOpenRequestedError(error);
        promise.reject(sparkError);
        _reject(sparkError);
        return Promise.reject(sparkError);
      }
    });
  }
  /**
   * @description Handles rejecting an inbound channel open request
   * - creates an open rejection event and sends it to the peer
   * @param {ChannelOpenRequestEvent} requestEvent
   * @returns {Promise<void>}
   * @throws {REJECT_OPEN_ERROR}
   */
  async _rejectOpen(requestOrAcceptEvent) {
    const promise = this._openPromises.get(this.cid);
    try {
      const rejectEvent = await this._createEvent(_types.ChannelEventType.OPEN_REJECTION, requestOrAcceptEvent);
      this._sendRequest(rejectEvent);
      if (promise) {
        promise.resolve(rejectEvent);
        this._openPromises.delete(this.cid);
      }
    } catch (error) {
      const sparkError = _channel.ChannelErrors.ConfirmOpenError(error);
      if (promise) {
        promise.reject(sparkError);
        this._openPromises.delete(this.cid);
      }
      return Promise.reject(error);
    }
  }
  /**
   * @description Handles inbound channel open acceptances
   * - sets up callbacks and passes data to handleOpenAccepted
   * @param {ChannelOpenAcceptanceEvent} acceptanceEvent
   * @throws {ON_OPEN_ACCEPTED_ERROR} 
   */
  async _onOpenAccepted(acceptanceEvent) {
    try {
      const promise = this._openPromises.get(this.cid);
      if (!promise) throw new Error("Open promise not found");
      this.handleOpenAccepted({
        event: acceptanceEvent,
        resolve: this._confirmOpen.bind(this, acceptanceEvent),
        reject: this._rejectOpen.bind(this, acceptanceEvent)
      });
    } catch (error) {
      const sparkError = _channel.ChannelErrors.OnOpenAcceptedError(error);
      const promise = this._openPromises.get(this.cid);
      promise.reject(sparkError);
      return Promise.reject(sparkError);
    }
  }
  /**
   * @description Handles confirming an inbound channel open acceptance
   * - sets the channel's peer and shared key
   * - checks the receipt digest
   * - creates an open confirmation event and sends it to the peer
   * - resolves the open promise with the acceptance event
   * @param {ChannelOpenAcceptanceEvent} acceptanceEvent
   * @throws {CONFIRM_OPEN_ERROR}
   */
  async _confirmOpen(acceptanceEvent) {
    return new Promise(async (_resolve, _reject) => {
      try {
        await this._setPeer(acceptanceEvent);
        const event = await this._createEvent(_types.ChannelEventType.OPEN_CONFIRMATION, acceptanceEvent);
        const validReciept = await this._openReceiptDigest(_types.ChannelReceiptType.OPEN_ACCEPTED, acceptanceEvent.data.receipt);
        if (!validReciept) throw new Error("Invalid acceptance receipt");
        this._sendRequest(event);
        this.handleOpened(acceptanceEvent);
        _resolve(this);
        this._openPromises.delete(this.cid);
      } catch (error) {
        const sparkError = _channel.ChannelErrors.ConfirmOpenError(error);
        const promise = this._openPromises.get(this.cid);
        if (promise) {
          promise.reject(sparkError);
          this._openPromises.delete(this.cid);
        }
        _reject(sparkError);
        return Promise.reject(sparkError);
      }
    });
  }
  /**
   * @description Handles inbound channel open confirmations
   * - checks the receipt digest
   * - resolves the open promise with the confirmation event
   * @param {ChannelOpenConfirmationEvent} confirmationEvent
   * @throws {OPEN_CONFIRMED_ERROR}
   */
  async _onOpenConfirmed(confirmEvent) {
    try {
      const validReciept = await this._openReceiptDigest(_types.ChannelReceiptType.OPEN_CONFIRMED, confirmEvent.data.receipt);
      if (!validReciept) throw new Error("Invalid confirmation receipt");
      this.handleOpened(confirmEvent);
    } catch (error) {
      const sparkError = _channel.ChannelErrors.OpenConfirmedError(error);
      const promise = this._openPromises.get(this.cid);
      if (promise) {
        promise.reject(sparkError);
        this._openPromises.delete(this.cid);
      }
      return Promise.reject(sparkError);
    }
  }
  /**
   * @description Handles inbound channel open rejections
   * - rejects the open promise with the rejection event
   * @param {ChannelOpenRejectionEvent} rejectionEvent
   * @throws {OPEN_REJECTED_ERROR}
   */
  async _onOpenRejected(rejectEvent) {
    try {
      const promise = this._openPromises.get(this.cid);
      if (!promise) throw new Error("Open promise not found");
      promise.reject(rejectEvent);
      this._openPromises.delete(this.cid);
    } catch (error) {
      const sparkError = _channel.ChannelErrors.OpenRejectedError(error);
      return Promise.reject(sparkError);
    }
  }
  _handleOpened(openEvent) {
    const promise = this._openPromises.get(this.cid);
    const validEventTypes = [_types.ChannelEventType.OPEN_ACCEPTANCE, _types.ChannelEventType.OPEN_CONFIRMATION];
    if (!validEventTypes.includes(openEvent.type)) throw new Error("Invalid open event type");
    if (!promise) throw new Error("Open promise not found");
    this._status = _types.ChannelState.OPENED;
    promise.resolve(this);
    this._openPromises.delete(this.cid);
  }
  async _onClosed(closeEvent) {
    try {
      const event = await this._createEvent(_types.ChannelEventType.CLOSE_CONFIRMATION, closeEvent);
      this._sendRequest(event);
      this.handleClosed(closeEvent);
    } catch (error) {
      const sparkError = _channel.ChannelErrors.OnClosedError(error);
      return Promise.reject(sparkError);
    }
  }
  async _onCloseConfirmed(confirmEvent) {
    try {
      const validReciept = await this._openReceiptDigest(_types.ChannelReceiptType.CLOSE_CONFIRMED, confirmEvent.data.receipt);
      if (!validReciept) throw new Error("Invalid confirmation receipt");
      this.handleClosed(confirmEvent);
    } catch (error) {
      const sparkError = _channel.ChannelErrors.OnCloseConfirmedError(error);
      const promise = this._closePromises.get(this.cid);
      if (this._closePromises.get(this.cid)) {
        promise.reject(sparkError);
        this._closePromises.delete(this.cid);
      }
      return Promise.reject(sparkError);
    }
  }
  _handleClosed(closeOrConfirmEvent) {
    if (closeOrConfirmEvent.type === _types.ChannelEventType.CLOSE_CONFIRMATION) {
      const promise = this._closePromises.get(this.cid);
      if (!promise) throw new Error("Close promise not found");
      promise.resolve(closeOrConfirmEvent);
      this._closePromises.delete(this.cid);
    } else if (closeOrConfirmEvent.type !== _types.ChannelEventType.CLOSE) {
      throw new Error("Invalid close event type");
    }
    this._status = _types.ChannelState.CLOSED;
    this._openPromises.delete(this.cid);
    this._closePromises.delete(this.cid);
    this._messagePromises.clear();
    this._sharedKey = null;
  }
  async _onMessage(messageEvent) {
    try {
      const message = await this._openMessageDigest(messageEvent.data);
      const decryptedEvent = {
        ...messageEvent,
        type: _types.ChannelEventType.MESSAGE_RECEIVED,
        data: message
      };
      const event = await this._createEvent(_types.ChannelEventType.MESSAGE_CONFIRMATION, decryptedEvent);
      this._sendRequest(event);
      this._listeners.get(_types.ChannelEventType.MESSAGE_RECEIVED).forEach(callback => {
        callback(decryptedEvent);
      });
    } catch (error) {
      const sparkError = _channel.ChannelErrors.OnMessageError(error);
      return Promise.reject(sparkError);
    }
  }
  async _onMessageConfirmed(confirmEvent) {
    const promise = this._messagePromises.get(confirmEvent.metadata.mid);
    try {
      const validReciept = await this._openReceiptDigest(_types.ChannelReceiptType.MESSAGE_RECEIVED, confirmEvent.data.receipt);
      if (!validReciept) throw new Error("Invalid confirmation receipt");
      if (!promise) throw new Error("Message promise not found");
      promise.resolve(confirmEvent);
      this._messagePromises.delete(confirmEvent.metadata.mid);
    } catch (error) {
      const sparkError = _channel.ChannelErrors.OnMessageConfirmedError(error);
      if (promise) {
        promise.reject(sparkError);
        this._messagePromises.delete(confirmEvent.metadata.mid);
      }
      return Promise.reject(sparkError);
    }
  }
  _sendRequest(event) {
    try {
      if (!this.sendRequest) throw new Error("sendRequest method not implemented");
      const result = this.sendRequest(event);
      this._eventLog.push({
        request: true,
        ...event
      });
      return result;
    } catch (error) {
      const sparkError = _channel.ChannelErrors.HandleRequestError(error);
      return Promise.reject(sparkError);
    }
  }
  _handleResponse(event) {
    const {
      type
    } = event;
    const isEvent = Object.values(_types.ChannelEventType).includes(type);
    if (isEvent) {
      this._eventLog.push({
        response: true,
        ...event
      });
      const listeners = this._listeners.get(type);
      if (listeners) {
        listeners.forEach(callback => {
          callback(event);
        });
      }
    }
    switch (type) {
      case _types.ChannelEventType.OPEN_REQUEST:
        return this._onOpenRequested(event);
      case _types.ChannelEventType.OPEN_ACCEPTANCE:
        return this._onOpenAccepted(event);
      case _types.ChannelEventType.OPEN_CONFIRMATION:
        return this._onOpenConfirmed(event);
      case _types.ChannelEventType.OPEN_REJECTION:
        return this._onOpenRejected(event);
      case _types.ChannelEventType.CLOSE:
        return this._onClosed(event);
      case _types.ChannelEventType.CLOSE_CONFIRMATION:
        return this._onCloseConfirmed(event);
      case _types.ChannelEventType.MESSAGE:
        return this._onMessage(event);
      case _types.ChannelEventType.MESSAGE_CONFIRMATION:
        return this._onMessageConfirmed(event);
    }
  }
  handleResponse(event) {
    return this._handleResponse(event);
  }
  handleClosed(closeOrConfirmEvent) {
    this._handleClosed(closeOrConfirmEvent);
  }
  handleOpened(openEvent) {
    this._handleOpened(openEvent);
  }
  async export() {
    return Promise.resolve({
      type: this.constructor["type"],
      cid: this._cid,
      peer: {
        identifier: this._peer?.identifier,
        publicKeys: this._peer?.publicKeys
      },
      eventLog: this._eventLog
    });
  }
  async import(data) {
    const {
      cid,
      peer,
      eventLog
    } = data;
    this._cid = cid;
    this._peer = peer;
    this._eventLog = eventLog;
    return Promise.resolve();
  }
}
// PUBLIC GETTERS
exports.CoreChannel = CoreChannel;
CoreChannel.type = _types.ChannelType.CORE_CHANNEL;