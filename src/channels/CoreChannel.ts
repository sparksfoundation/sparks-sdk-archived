/**
 * TODO 
 * - add _messageQueue logic to handle messages that come in before the channel is opened
 * - add timeouts for open, close and message promises
 * - add max retries for open, close and message attempts
 */
import { Spark } from "../Spark";
import cuid from "cuid";
import { utcEpochTimestamp } from "../utilities";
import {
  AnyChannelEvent, AnyChannelReceipt, ChannelCloseConfirmationEvent,
  ChannelCloseConfirmationReceipt, ChannelCloseEvent, ChannelDecryptedMessageEvent, ChannelErrorEvent,
  ChannelEventLog, ChannelEventType, ChannelId, ChannelMessageConfirmationEvent,
  ChannelMessageEvent, ChannelMessageId, ChannelMessageData, ChannelMessageDataDigest, ChannelMessageReceivedReceipt,
  ChannelOpenAcceptanceEvent, ChannelOpenAcceptanceReceipt, ChannelOpenConfirmationEvent,
  ChannelOpenConfirmationReceipt, ChannelOpenRejectionEvent, ChannelOpenRequestEvent,
  ChannelPeer, ChannelReceiptDigest, ChannelReceiptType, ChannelState, HandleOpenAccepted, HandleOpenRequested, RejectPromise,
  ResolveClosePromise, ResolveMessagePromise, ResolveOpenPromise, ChannelType
} from "./types";
import { EncryptionSharedKey } from "../ciphers/types";
import { ChannelErrors } from "../errors/channel";
import { SparkError } from "../errors/SparkError";
import { AnyChannelEventWithSource } from "./types";

export abstract class CoreChannel {
  // opens and resolves/rejects on both sides
  private _openPromises: Map<ChannelId, { resolve: ResolveOpenPromise, reject: RejectPromise }> = new Map();

  // opens and resolves/rejects only on initiator side
  private _closePromises: Map<ChannelId, { resolve: ResolveClosePromise, reject: RejectPromise }> = new Map();
  private _messagePromises: Map<ChannelMessageId, { resolve: ResolveMessagePromise, reject: RejectPromise }> = new Map();

  // queue messages that come in before the complete open call
  private _messageQueue: any;

  // spark instance
  protected _spark: Spark<any, any, any, any, any>;

  // channel properties
  private _cid: ChannelId;
  private _peer: ChannelPeer;
  private _sharedKey: EncryptionSharedKey;
  private _status: ChannelState;
  private _eventLog: ChannelEventLog;

  // PUBLIC EVENT HANDLERS
  public onmessage: (data: any) => void | never;
  public onclose: (data: any) => void | never;
  public onerror: (data: any) => void | never;

  // PUBLIC GETTERS
  public static type: ChannelType = ChannelType.CORE_CHANNEL;
  public get cid(): ChannelId { return this._cid; }
  public get peer(): ChannelPeer { return this._peer; }
  public get sharedKey(): EncryptionSharedKey { return this._sharedKey; }
  public get status(): ChannelState { return this._status; }
  public get eventLog(): ChannelEventLog { return this._eventLog; }

  constructor({ cid, spark, eventLog, peer }: { cid: ChannelId, spark: Spark<any, any, any, any, any>, save?: boolean, eventLog?: ChannelEventLog, peer?: ChannelPeer }) {
    this._spark = spark;
    this._cid = cid || cuid();
    this._eventLog = eventLog || [];
    this._status = ChannelState.CLOSED;
    this._peer = peer || null;

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.message = this.message.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
  }

  /**
   * PRIVATE UTILITY METHODS
   */

  private async _createReceiptDigest(type: ChannelReceiptType, prev: AnyChannelEvent): Promise<ChannelReceiptDigest> {
    try {
      const { data = {}, metadata = {} } = prev as any || {};
      const ourInfo = { identifier: this._spark.identifier, publicKeys: this._spark.publicKeys };
      const theirInfo = { identifier: data?.identifier, publicKeys: data?.publicKeys };
      const sharedKey = this._sharedKey;
      const eventEncrypted = await this._spark.encrypt({ data: prev, sharedKey });
      const eventSealed = await this._spark.seal({ data: eventEncrypted });

      let receipt: AnyChannelReceipt;
      switch (prev.type) {
        case ChannelEventType.OPEN_REQUEST:
          receipt = {
            type: ChannelReceiptType.OPEN_ACCEPTED,
            peers: [ourInfo, theirInfo],
            eventDigest: eventSealed,
          } as ChannelOpenAcceptanceReceipt;
          break;
        case ChannelEventType.OPEN_ACCEPTANCE:
          receipt = {
            type: ChannelReceiptType.OPEN_CONFIRMED,
            peers: [ourInfo, theirInfo],
            eventDigest: eventSealed,
          };
          break;
        case ChannelEventType.CLOSE:
          receipt = {
            type: ChannelReceiptType.CLOSE_CONFIRMED,
            eventDigest: eventSealed,
          };
          break;
        case ChannelEventType.MESSAGE:
          receipt = {
            type: ChannelReceiptType.MESSAGE_RECEIVED,
            messageDigest: await this._createMessageDigest(data),
            eventDigest: eventSealed,
          };
          break;
        default:
          return null;
      }

      if (!receipt) throw new Error("Receipt could not be generated");
      const receiptEncrypted = await this._spark.encrypt({ data: receipt, sharedKey });
      const sealedReceiptDigest = await this._spark.seal({ data: receiptEncrypted });
      return sealedReceiptDigest;

    } catch (error) {
      error.metadata = { receipt: type };
      const sparkError = ChannelErrors.CreateReceiptDigestError(error);
      return Promise.reject(sparkError);
    }
  }

  private async _openReceiptDigest(type: ChannelReceiptType.OPEN_ACCEPTED, receipDigest): Promise<ChannelOpenAcceptanceReceipt>;
  private async _openReceiptDigest(type: ChannelReceiptType.OPEN_CONFIRMED, receipDigest): Promise<ChannelOpenConfirmationReceipt>;
  private async _openReceiptDigest(type: ChannelReceiptType.CLOSE_CONFIRMED, receipDigest): Promise<ChannelCloseConfirmationReceipt>;
  private async _openReceiptDigest(type: ChannelReceiptType.MESSAGE_RECEIVED, receipDigest): Promise<ChannelMessageReceivedReceipt>;
  private async _openReceiptDigest(type: ChannelReceiptType, receipDigest): Promise<AnyChannelReceipt> {
    try {
      const sharedKey = this._sharedKey;
      const publicKey = this._peer.publicKeys.signer;
      const receiptEncrypted = await this._spark.open({ signature: receipDigest, publicKey });
      const receipt = await this._spark.decrypt({ data: receiptEncrypted, sharedKey });
      return receipt;
    } catch (error) {
      error.metadata = { receipt: type };
      const sparkError = ChannelErrors.CreateReceiptDigestError(error);
      return Promise.reject(sparkError);
    }
  }

  private async _createMessageDigest(data: ChannelMessageData) {
    try {
      const sharedKey = this._sharedKey;
      const messageEncrypted = await this._spark.encrypt({ data: data, sharedKey });
      const messageSealed = await this._spark.seal({ data: messageEncrypted });
      return messageSealed;
    } catch (error) {
      const sparkError = ChannelErrors.CreateMessageDigestError(error);
      return Promise.reject(sparkError);
    }
  }

  private async _openMessageDigest(messageDigest: ChannelMessageDataDigest): Promise<ChannelMessageData> {
    try {
      const sharedKey = this._sharedKey;
      const messageEncrypted = await this._spark.open({ signature: messageDigest, publicKey: this._peer.publicKeys.signer });
      const message = await this._spark.decrypt({ data: messageEncrypted, sharedKey });
      return message;
    } catch (error) {
      const sparkError = ChannelErrors.OpenMessageDigestError(error);
      return Promise.reject(sparkError);
    }
  }

  private async _createEvent(type: ChannelEventType.OPEN_REQUEST, event: null): Promise<ChannelOpenRequestEvent>;
  private async _createEvent(type: ChannelEventType.OPEN_ACCEPTANCE, event: ChannelOpenRequestEvent): Promise<ChannelOpenAcceptanceEvent>;
  private async _createEvent(type: ChannelEventType.OPEN_CONFIRMATION, event: ChannelOpenAcceptanceEvent): Promise<ChannelOpenConfirmationEvent>;
  private async _createEvent(type: ChannelEventType.CLOSE, event: ChannelOpenConfirmationEvent): Promise<ChannelCloseEvent>;
  private async _createEvent(type: ChannelEventType.CLOSE_CONFIRMATION, event: ChannelCloseEvent): Promise<ChannelCloseConfirmationEvent>;
  private async _createEvent(type: ChannelEventType.MESSAGE, event: ChannelMessageData): Promise<ChannelMessageEvent>;
  private async _createEvent(type: ChannelEventType.MESSAGE_CONFIRMATION, event: ChannelDecryptedMessageEvent): Promise<ChannelMessageConfirmationEvent>;
  private async _createEvent(type: ChannelEventType.OPEN_REJECTION, event: ChannelOpenAcceptanceEvent | ChannelOpenConfirmationEvent): Promise<ChannelOpenRejectionEvent>;
  private async _createEvent(type: ChannelEventType.CHANNEL_ERROR, event: AnyChannelEvent): Promise<ChannelErrorEvent>;
  private async _createEvent(type: ChannelEventType, event: AnyChannelEvent): Promise<AnyChannelEvent> {
    try {
      const { data = {}, metadata = {} } = event as any || {};
      const cid = this.cid;
      const eid = this._eventLog.length ? this._eventLog[this._eventLog.length - 1]?.metadata?.eid : cuid.slug();
      const nid = cuid.slug();
      const mid = metadata?.mid || cuid.slug();
      const timestamp = utcEpochTimestamp();
      const ourInfo = { identifier: this._spark.identifier, publicKeys: this._spark.publicKeys };

      switch (type) {
        case ChannelEventType.OPEN_REQUEST:
          return {
            type: ChannelEventType.OPEN_REQUEST,
            timestamp,
            data: {
              identifier: ourInfo.identifier,
              publicKeys: ourInfo.publicKeys,
            },
            metadata: { eid, cid, nid },
          };
        case ChannelEventType.OPEN_ACCEPTANCE:
          return {
            type: ChannelEventType.OPEN_ACCEPTANCE,
            timestamp,
            data: {
              identifier: ourInfo.identifier,
              publicKeys: ourInfo.publicKeys,
              receipt: await this._createReceiptDigest(ChannelReceiptType.OPEN_ACCEPTED, event)
            },
            metadata: { eid, cid, nid },
          };
        case ChannelEventType.OPEN_CONFIRMATION:
          return {
            type: ChannelEventType.OPEN_CONFIRMATION,
            timestamp,
            data: {
              receipt: await this._createReceiptDigest(ChannelReceiptType.OPEN_CONFIRMED, event),
            },
            metadata: { eid, cid, nid }
          };
        case ChannelEventType.OPEN_REJECTION:
          return {
            type: ChannelEventType.OPEN_REJECTION,
            timestamp,
            data: {},
            metadata: { eid, cid, nid },
          };
        case ChannelEventType.CLOSE:
          return {
            type: ChannelEventType.CLOSE,
            timestamp,
            data: {},
            metadata: { eid, cid, nid },
          };
        case ChannelEventType.CLOSE_CONFIRMATION:
          return {
            type: ChannelEventType.CLOSE_CONFIRMATION,
            timestamp,
            data: {
              receipt: await this._createReceiptDigest(ChannelReceiptType.CLOSE_CONFIRMED, event),
            },
            metadata: { eid, cid, nid },
          };
        case ChannelEventType.MESSAGE:
          return {
            type: ChannelEventType.MESSAGE,
            timestamp,
            data: await this._createMessageDigest(data),
            metadata: { eid, cid, nid, mid },
          };
        case ChannelEventType.MESSAGE_CONFIRMATION:
          return {
            type: ChannelEventType.MESSAGE_CONFIRMATION,
            timestamp,
            data: {
              receipt: await this._createReceiptDigest(ChannelReceiptType.MESSAGE_RECEIVED, event),
            },
            metadata: { eid, cid, nid, mid },
          };
        case ChannelEventType.CHANNEL_ERROR:
          return {
            type: ChannelEventType.CHANNEL_ERROR,
            timestamp,
            data: data,
            metadata: { eid, cid, nid },
          };
        default:
          throw new Error("Invalid event type");
      }
    } catch (error) {
      error.metadata = { event: type };
      const sparkError = ChannelErrors.CreateEventError(error);
      return Promise.reject(sparkError);
    }
  }

  private async _setPeer(event: ChannelOpenRequestEvent | ChannelOpenAcceptanceEvent): Promise<void> {
    try {
      const { data } = event;
      const { identifier, publicKeys } = data || {};
      const { cipher, signer } = publicKeys || {};
      if (!identifier || !cipher || !signer) throw new Error("Invalid peer data");

      this._peer = {
        identifier: data.identifier,
        publicKeys: data.publicKeys
      };

      const sharedKey = await this._spark.generateCipherSharedKey({ publicKey: cipher });
      this._sharedKey = sharedKey;

    } catch (error) {
      error.metadata = { event };
      const sparkError = ChannelErrors.SetPeerError(error);
      return Promise.reject(sparkError);
    }
  }

  /**
   * PUBLIC CHANNEL METHODS
   * - can be be extended by child classes if needed
   * - should be exposed to user and called directly
   */
  /**
   * @description Initiates opening a channel
   * - sets a promise to be 
   *   - resolved w/open confirmation event
   *   - rejected w/open rejection event
   * - creates an open request event and sends it to the peer
   * @throws {OPEN_REQUEST_ERROR}
   * @returns {Promise<ChannelOpenConfirmationEvent>}
   */
  public async open(): Promise<CoreChannel | ChannelOpenRejectionEvent | SparkError> {
    return new Promise(async (_resolve, _reject) => {
      try {
        if (this._status !== ChannelState.CLOSED) {
          throw new Error("Channel is not closed");
        }
        this._status = ChannelState.PENDING;
        const resolve = _resolve as ResolveOpenPromise;
        const reject = _reject as RejectPromise;
        this._openPromises.set(this.cid, { resolve, reject });
        const event: ChannelOpenRequestEvent = await this._createEvent(ChannelEventType.OPEN_REQUEST, null);
        this._sendRequest(event);
      } catch (error) {
        this._openPromises.delete(this.cid);
        return _reject(ChannelErrors.OpenRequestError(error));
      }
    })
  }

  public close(): Promise<ChannelCloseConfirmationEvent | SparkError> {
    return new Promise(async (_resolve, _reject) => {
      try {
        const resolve = _resolve as ResolveClosePromise;
        const reject = _reject as RejectPromise;
        this._closePromises.set(this.cid, { resolve, reject });
        const event: ChannelCloseEvent = await this._createEvent(ChannelEventType.CLOSE, null);
        this._sendRequest(event);
      } catch (error) {
        this._closePromises.delete(this.cid);
        return _reject(ChannelErrors.OpenRequestError(error));
      }
    })
  }

  public message(data): Promise<ChannelMessageConfirmationEvent> {
    return new Promise(async (_resolve, _reject) => {
      try {
        if (this._status !== ChannelState.OPENED) {
          throw new Error("Channel is not open");
        }
        const resolve = _resolve as ResolveMessagePromise;
        const reject = _reject as RejectPromise;
        const event: ChannelMessageEvent = await this._createEvent(ChannelEventType.MESSAGE, { data });
        this._messagePromises.set(event.metadata.mid, { resolve, reject });
        this._sendRequest(event);
      } catch (error) {
        return _reject(ChannelErrors.MessageSendingError(error));
      }
    })
  }

  public async getLoggedEventMessage(event: AnyChannelEventWithSource): Promise<ChannelMessageData> {
    try {
      const publicKey = event.request ? this._spark.publicKeys.signer : this._peer.publicKeys.signer;
      const sharedKey = this._sharedKey; 
      switch (event.type) {
        case ChannelEventType.MESSAGE:
          const opened = await this._spark.open({ signature: event.data, publicKey })
          const decrypted = await this._spark.decrypt({ data: opened, sharedKey });
          return Promise.resolve(decrypted);
        case ChannelEventType.MESSAGE_CONFIRMATION:
          const openedReceipt = await this._spark.open({ signature: event.data.receipt, publicKey });
          const decryptedReceipt = await this._spark.decrypt({ data: openedReceipt, sharedKey });
          const openedMsg = await this._spark.open({ signature: decryptedReceipt.messageDigest, publicKey });
          const decryptedMsg = await this._spark.decrypt({ data: openedMsg, sharedKey });
          return Promise.resolve(decryptedMsg);
      }
    } catch (error) {
      error.metadata = { event: event.type, message: error.message };
      const sparkError = ChannelErrors.GetEventMessageError(error);
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
  private _onOpenRequested(requestEvent: ChannelOpenRequestEvent) {
    try {
      this.handleOpenRequested({
        event: requestEvent,
        resolve: this._acceptOpen.bind(this, requestEvent),
        reject: this._rejectOpen.bind(this, requestEvent),
      });
    } catch (error) {
      const sparkError = ChannelErrors.OnOpenRequestedError(error);
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
  private async _acceptOpen(requestEvent: ChannelOpenRequestEvent): Promise<CoreChannel> {
    return new Promise(async (_resolve, _reject) => {
      try {
        await this._setPeer(requestEvent);
        const resolve = _resolve as ResolveOpenPromise;
        const reject = _reject as RejectPromise;
        this._openPromises.set(this.cid, { resolve, reject });

        const event: ChannelOpenAcceptanceEvent = await this._createEvent(ChannelEventType.OPEN_ACCEPTANCE, requestEvent);
        this._sendRequest(event);

      } catch (error) {
        const promise = this._openPromises.get(this.cid);
        const sparkError = ChannelErrors.OnOpenRequestedError(error);
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
  private async _rejectOpen(requestOrAcceptEvent: ChannelOpenAcceptanceEvent | ChannelOpenConfirmationEvent) {
    const promise = this._openPromises.get(this.cid);
    try {
      const rejectEvent: ChannelOpenRejectionEvent = await this._createEvent(ChannelEventType.OPEN_REJECTION, requestOrAcceptEvent);
      this._sendRequest(rejectEvent);
      if (promise) {
        promise.resolve(rejectEvent);
        this._openPromises.delete(this.cid);
      }
    } catch (error) {
      const sparkError = ChannelErrors.ConfirmOpenError(error);
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
  private async _onOpenAccepted(acceptanceEvent: ChannelOpenAcceptanceEvent) {
    try {
      const promise = this._openPromises.get(this.cid);
      if (!promise) throw new Error("Open promise not found");
      this.handleOpenAccepted({
        event: acceptanceEvent,
        resolve: this._confirmOpen.bind(this, acceptanceEvent),
        reject: this._rejectOpen.bind(this, acceptanceEvent),
      });
    } catch (error) {
      const sparkError = ChannelErrors.OnOpenAcceptedError(error);
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
  private async _confirmOpen(acceptanceEvent: ChannelOpenAcceptanceEvent) {
    return new Promise(async (_resolve, _reject) => {
      try {
        await this._setPeer(acceptanceEvent);
        const event: ChannelOpenConfirmationEvent = await this._createEvent(ChannelEventType.OPEN_CONFIRMATION, acceptanceEvent);
        const validReciept: ChannelOpenAcceptanceReceipt = await this._openReceiptDigest(ChannelReceiptType.OPEN_ACCEPTED, acceptanceEvent.data.receipt);
        if (!validReciept) throw new Error("Invalid acceptance receipt");
        this._sendRequest(event);
        this.handleOpened(acceptanceEvent);
        _resolve(this);
        this._openPromises.delete(this.cid);
      } catch (error) {
        const sparkError = ChannelErrors.ConfirmOpenError(error);
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
  private async _onOpenConfirmed(confirmEvent: ChannelOpenConfirmationEvent) {
    try {
      const validReciept: ChannelOpenConfirmationReceipt = await this._openReceiptDigest(ChannelReceiptType.OPEN_CONFIRMED, confirmEvent.data.receipt);
      if (!validReciept) throw new Error("Invalid confirmation receipt");
      this.handleOpened(confirmEvent);
    } catch (error) {
      const sparkError = ChannelErrors.OpenConfirmedError(error);
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
  private async _onOpenRejected(rejectEvent: ChannelOpenRejectionEvent) {
    try {
      const promise = this._openPromises.get(this.cid);
      if (!promise) throw new Error("Open promise not found");
      promise.reject(rejectEvent);
      this._openPromises.delete(this.cid);
    } catch (error) {
      const sparkError = ChannelErrors.OpenRejectedError(error);
      return Promise.reject(sparkError);
    }
  }

  private _handleOpened(openEvent: ChannelOpenConfirmationEvent | ChannelOpenAcceptanceEvent) {
    // if it's not an accept or confirm event throw
    const promise = this._openPromises.get(this.cid);
    const validEventTypes = [ChannelEventType.OPEN_ACCEPTANCE, ChannelEventType.OPEN_CONFIRMATION];

    if (!validEventTypes.includes(openEvent.type)) throw new Error("Invalid open event type");
    if (!promise) throw new Error("Open promise not found");

    this._status = ChannelState.OPENED;
    promise.resolve(this);
    this._openPromises.delete(this.cid);
  }

  private async _onClosed(closeEvent: ChannelCloseEvent) {
    try {
      const event: ChannelCloseConfirmationEvent = await this._createEvent(ChannelEventType.CLOSE_CONFIRMATION, closeEvent);
      this._sendRequest(event);
      this.handleClosed(closeEvent);
    } catch (error) {
      const sparkError = ChannelErrors.OnClosedError(error);
      return Promise.reject(sparkError);
    }
  }

  private async _onCloseConfirmed(confirmEvent: ChannelCloseConfirmationEvent) {
    try {
      const validReciept: ChannelCloseConfirmationReceipt = await this._openReceiptDigest(ChannelReceiptType.CLOSE_CONFIRMED, confirmEvent.data.receipt);
      if (!validReciept) throw new Error("Invalid confirmation receipt");
      this.handleClosed(confirmEvent);
    } catch (error) {
      const sparkError = ChannelErrors.OnCloseConfirmedError(error);
      const promise = this._closePromises.get(this.cid);
      if (this._closePromises.get(this.cid)) {
        promise.reject(sparkError);
        this._closePromises.delete(this.cid);
      }
      return Promise.reject(sparkError);
    }
  }

  private _handleClosed(closeOrConfirmEvent: ChannelCloseConfirmationEvent | ChannelCloseEvent) {
    if (closeOrConfirmEvent.type === ChannelEventType.CLOSE_CONFIRMATION) {
      const promise = this._closePromises.get(this.cid);
      if (!promise) throw new Error("Close promise not found");
      promise.resolve(closeOrConfirmEvent as ChannelCloseConfirmationEvent);
      this._closePromises.delete(this.cid);
    } else if (closeOrConfirmEvent.type === ChannelEventType.CLOSE) {
      if (this.onclose) {
        this.onclose(closeOrConfirmEvent);
      }
    } else {
      throw new Error("Invalid close event type");
    }

    this._status = ChannelState.CLOSED;
    this._openPromises.delete(this.cid);
    this._closePromises.delete(this.cid);
    this._messagePromises.clear();
    this._sharedKey = null;
  }

  private async _onMessage(messageEvent: ChannelMessageEvent) {
    try {
      const message = await this._openMessageDigest(messageEvent.data);
      const decryptedEvent: ChannelDecryptedMessageEvent = { ...messageEvent, data: message }
      const event: ChannelMessageConfirmationEvent = await this._createEvent(ChannelEventType.MESSAGE_CONFIRMATION, decryptedEvent);
      if (this.onmessage) this.onmessage(decryptedEvent);
      this._sendRequest(event);
    } catch (error) {
      const sparkError = ChannelErrors.OnMessageError(error);
      return Promise.reject(sparkError);
    }
  }

  private async _onMessageConfirmed(confirmEvent: ChannelMessageConfirmationEvent) {
    const promise = this._messagePromises.get(confirmEvent.metadata.mid);
    try {
      const validReciept: ChannelMessageReceivedReceipt = await this._openReceiptDigest(ChannelReceiptType.MESSAGE_RECEIVED, confirmEvent.data.receipt);
      if (!validReciept) throw new Error("Invalid confirmation receipt");
      if (!promise) throw new Error("Message promise not found");
      promise.resolve(confirmEvent);
      this._messagePromises.delete(confirmEvent.metadata.mid);
    } catch (error) {
      const sparkError = ChannelErrors.OnMessageConfirmedError(error);
      if (promise) {
        promise.reject(sparkError);
        this._messagePromises.delete(confirmEvent.metadata.mid);
      }
      return Promise.reject(sparkError);
    }
  }

  private _sendRequest(event: AnyChannelEvent): Promise<void> {
    try {
      if (!this.sendRequest) throw new Error("sendRequest method not implemented");
      const result = this.sendRequest(event);
      this._eventLog.push({ request: true, ...event });
      return result;
    } catch (error) {
      const sparkError = ChannelErrors.HandleRequestError(error);
      return Promise.reject(sparkError);
    }
  }

  private _handleResponse(event: AnyChannelEvent): Promise<any> {
    const { type } = event;
    const isEvent = Object.values(ChannelEventType).includes(type);
    if (isEvent) this._eventLog.push({ response: true, ...event });
    switch (type) {
      case ChannelEventType.OPEN_REQUEST:
        return this._onOpenRequested(event as ChannelOpenRequestEvent);
      case ChannelEventType.OPEN_ACCEPTANCE:
        return this._onOpenAccepted(event as ChannelOpenAcceptanceEvent);
      case ChannelEventType.OPEN_CONFIRMATION:
        return this._onOpenConfirmed(event as ChannelOpenConfirmationEvent);
      case ChannelEventType.OPEN_REJECTION:
        return this._onOpenRejected(event as ChannelOpenRejectionEvent);
      case ChannelEventType.CLOSE:
        return this._onClosed(event as ChannelCloseEvent);
      case ChannelEventType.CLOSE_CONFIRMATION:
        return this._onCloseConfirmed(event as ChannelCloseConfirmationEvent);
      case ChannelEventType.MESSAGE:
        return this._onMessage(event as ChannelMessageEvent);
      case ChannelEventType.MESSAGE_CONFIRMATION:
        return this._onMessageConfirmed(event as ChannelMessageConfirmationEvent);
      case ChannelEventType.CHANNEL_ERROR:
        if (this.onerror) {
          this.onerror(event as ChannelErrorEvent);
        }
      default:
        break;
    }
  }

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
  protected handleOpenRequested: HandleOpenRequested = ({ event, resolve, reject }) => {
    return resolve();
  }

  /**
   * @description Handles inbound channel open acceptances
   * - to be overridden by user via extending classes
   * - if not overridden, will resolve the acceptance
   * - resolving triggers _confirmOpen
   * - rejecting triggers _rejectOpen
   */
  protected handleOpenAccepted: HandleOpenAccepted = ({ event, resolve, reject }) => {
    return resolve();
  }

  protected handleResponse(event: AnyChannelEvent): Promise<any> {
    return this._handleResponse(event);
  }

  protected handleClosed(closeOrConfirmEvent: ChannelCloseConfirmationEvent | ChannelCloseEvent) {
    this._handleClosed(closeOrConfirmEvent);
  }

  protected handleOpened(openEvent: ChannelOpenConfirmationEvent | ChannelOpenAcceptanceEvent) {
    this._handleOpened(openEvent);
  }

  protected abstract sendRequest(event: AnyChannelEvent): Promise<void>;

  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({
      type: this.constructor['type'],
      cid: this._cid,
      peer: {
        identifier: this._peer?.identifier,
        publicKeys: this._peer?.publicKeys,
      },
      eventLog: this._eventLog,
    });
  }

  public async import(data: Record<string, any>): Promise<void> {
    const { cid, peer, eventLog } = data;
    this._cid = cid;
    this._peer = peer;
    this._eventLog = eventLog;
    return Promise.resolve();
  }
}
