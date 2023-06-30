
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
  ResolveClosePromise, ResolveMessagePromise, ResolveOpenPromise
} from "./types";
import { EncryptionSharedKey } from "../ciphers/types";
import { ChannelErrors } from "../errors/channel";
import { SparkError } from "../errors/SparkError";

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
  public cid: ChannelId;
  public peer: ChannelPeer;
  public sharedKey: EncryptionSharedKey;
  public status: ChannelState;
  public eventLog: ChannelEventLog = [];

  // event callbacks for receivers only
  public onmessage: (data: any) => void | never;
  public onclose: (data: any) => void | never;
  public onerror: (data: any) => void | never;

  constructor({ cid, spark }: { cid: ChannelId, spark: Spark<any, any, any, any, any> }) {
    this._spark = spark;
    this.cid = cid || cuid();

    // bind public methods
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.message = this.message.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.status = ChannelState.CLOSED;
  }

  private async createReceiptDigest(type: ChannelReceiptType, prev: AnyChannelEvent): Promise<ChannelReceiptDigest> {
    try {
      const { data = {}, metadata = {} } = prev as any || {};
      const ourInfo = { identifier: this._spark.identifier, publicKeys: this._spark.publicKeys };
      const theirInfo = { identifier: data?.identifier, publicKeys: data?.publicKeys };
      const sharedKey = this.sharedKey;
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
            messageDigest: await this.createMessageDigest(data),
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

  private async openReceiptDigest(type: ChannelReceiptType.OPEN_ACCEPTED, receipDigest): Promise<ChannelOpenAcceptanceReceipt>;
  private async openReceiptDigest(type: ChannelReceiptType.OPEN_CONFIRMED, receipDigest): Promise<ChannelOpenConfirmationReceipt>;
  private async openReceiptDigest(type: ChannelReceiptType.CLOSE_CONFIRMED, receipDigest): Promise<ChannelCloseConfirmationReceipt>;
  private async openReceiptDigest(type: ChannelReceiptType.MESSAGE_RECEIVED, receipDigest): Promise<ChannelMessageReceivedReceipt>;
  private async openReceiptDigest(type: ChannelReceiptType, receipDigest): Promise<AnyChannelReceipt> {
    try {
      const sharedKey = this.sharedKey;
      const publicKey = this.peer.publicKeys.signer;
      const receiptEncrypted = await this._spark.open({ signature: receipDigest, publicKey });
      const receipt = await this._spark.decrypt({ data: receiptEncrypted, sharedKey });
      return receipt;
    } catch (error) {
      error.metadata = { receipt: type };
      const sparkError = ChannelErrors.CreateReceiptDigestError(error);
      return Promise.reject(sparkError);
    }
  }

  private async createMessageDigest(data: ChannelMessageData) {
    try {
      const sharedKey = this.sharedKey;
      const messageEncrypted = await this._spark.encrypt({ data: data, sharedKey });
      const messageSealed = await this._spark.seal({ data: messageEncrypted });
      return messageSealed;
    } catch (error) {
      const sparkError = ChannelErrors.CreateMessageDigestError(error);
      return Promise.reject(sparkError);
    }
  }

  private async openMessageDigest(messageDigest: ChannelMessageDataDigest): Promise<ChannelMessageData> {
    try {
      const sharedKey = this.sharedKey;
      const messageEncrypted = await this._spark.open({ signature: messageDigest, publicKey: this.peer.publicKeys.signer });
      const message = await this._spark.decrypt({ data: messageEncrypted, sharedKey });
      return message;
    } catch (error) {
      const sparkError = ChannelErrors.OpenMessageDigestError(error);
      return Promise.reject(sparkError);
    }
  }

  private async createEvent(type: ChannelEventType.OPEN_REQUEST, event: null): Promise<ChannelOpenRequestEvent>;
  private async createEvent(type: ChannelEventType.OPEN_ACCEPTANCE, event: ChannelOpenRequestEvent): Promise<ChannelOpenAcceptanceEvent>;
  private async createEvent(type: ChannelEventType.OPEN_CONFIRMATION, event: ChannelOpenAcceptanceEvent): Promise<ChannelOpenConfirmationEvent>;
  private async createEvent(type: ChannelEventType.CLOSE, event: ChannelOpenConfirmationEvent): Promise<ChannelCloseEvent>;
  private async createEvent(type: ChannelEventType.CLOSE_CONFIRMATION, event: ChannelCloseEvent): Promise<ChannelCloseConfirmationEvent>;
  private async createEvent(type: ChannelEventType.MESSAGE, event: ChannelMessageData): Promise<ChannelMessageEvent>;
  private async createEvent(type: ChannelEventType.MESSAGE_CONFIRMATION, event: ChannelDecryptedMessageEvent): Promise<ChannelMessageConfirmationEvent>;
  private async createEvent(type: ChannelEventType.OPEN_REJECTION, event: ChannelOpenAcceptanceEvent | ChannelOpenConfirmationEvent): Promise<ChannelOpenRejectionEvent>;
  private async createEvent(type: ChannelEventType.CHANNEL_ERROR, event: AnyChannelEvent): Promise<ChannelErrorEvent>;
  private async createEvent(type: ChannelEventType, event: AnyChannelEvent): Promise<AnyChannelEvent> {
    try {
      const { data = {}, metadata = {} } = event as any || {};
      const cid = this.cid;
      const eid = this.eventLog.length ? this.eventLog[this.eventLog.length - 1]?.metadata?.eid : cuid.slug();
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
              receipt: await this.createReceiptDigest(ChannelReceiptType.OPEN_ACCEPTED, event)
            },
            metadata: { eid, cid, nid },
          };
        case ChannelEventType.OPEN_CONFIRMATION:
          return {
            type: ChannelEventType.OPEN_CONFIRMATION,
            timestamp,
            data: {
              receipt: await this.createReceiptDigest(ChannelReceiptType.OPEN_CONFIRMED, event),
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
              receipt: await this.createReceiptDigest(ChannelReceiptType.CLOSE_CONFIRMED, event),
            },
            metadata: { eid, cid, nid },
          };
        case ChannelEventType.MESSAGE:
          return {
            type: ChannelEventType.MESSAGE,
            timestamp,
            data: await this.createMessageDigest(data),
            metadata: { eid, cid, nid, mid },
          };
        case ChannelEventType.MESSAGE_CONFIRMATION:
          return {
            type: ChannelEventType.MESSAGE_CONFIRMATION,
            timestamp,
            data: {
              receipt: await this.createReceiptDigest(ChannelReceiptType.MESSAGE_RECEIVED, event),
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

  private async setPeer(event: ChannelOpenRequestEvent | ChannelOpenAcceptanceEvent): Promise<void> {
    try {
      const { data } = event;
      const { identifier, publicKeys } = data || {};
      const { cipher, signer } = publicKeys || {};
      if (!identifier || !cipher || !signer) throw new Error("Invalid peer data");

      this.peer = {
        identifier: data.identifier,
        publicKeys: data.publicKeys
      };

      const sharedKey = await this._spark.generateCipherSharedKey({ publicKey: cipher });
      this.sharedKey = sharedKey;

    } catch (error) {
      error.metadata = { event };
      const sparkError = ChannelErrors.SetPeerError(error);
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
  public async open(): Promise<CoreChannel | ChannelOpenRejectionEvent | SparkError> {
    return new Promise(async (_resolve, _reject) => {
      try {
        if (this.status !== ChannelState.CLOSED) {
          throw new Error("Channel is not closed");
        }
        this.status = ChannelState.PENDING;
        const resolve = _resolve as ResolveOpenPromise;
        const reject = _reject as RejectPromise;
        this._openPromises.set(this.cid, { resolve, reject });
        const event: ChannelOpenRequestEvent = await this.createEvent(ChannelEventType.OPEN_REQUEST, null);
        this._sendRequest(event);
      } catch (error) {
        this._openPromises.delete(this.cid);
        return _reject(ChannelErrors.OpenRequestError(error));
      }
    })
  }

  /**
   * @description Handles inbound channel open requests
   * - to be overridden by user via extending classes
   * - if not overridden, will resolve the request
   * - resolving triggers acceptOpen
   * - rejecting triggers rejectOpen
   */
  protected handleOpenRequested: HandleOpenRequested = ({ event, resolve, reject }) => {
    return resolve();
  }

  /**
   * @description Handles inbound channel open requests
   * - sets up callbacks and passes data to handleOpenRequested
   * @param {ChannelOpenAcceptanceEvent} acceptanceEvent
   * @throws {ON_OPEN_REQUESTED_ERROR}
   */
  private onOpenRequested(requestEvent: ChannelOpenRequestEvent) {
    try {
      this.handleOpenRequested({
        event: requestEvent,
        resolve: this.acceptOpen.bind(this, requestEvent),
        reject: this.rejectOpen.bind(this, requestEvent),
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
  protected async acceptOpen(requestEvent: ChannelOpenRequestEvent): Promise<CoreChannel> {
    return new Promise(async (_resolve, _reject) => {
      try {
        await this.setPeer(requestEvent);

        const resolve = _resolve as ResolveOpenPromise;
        const reject = _reject as RejectPromise;
        this._openPromises.set(this.cid, { resolve, reject });

        const event: ChannelOpenAcceptanceEvent = await this.createEvent(ChannelEventType.OPEN_ACCEPTANCE, requestEvent);
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
  protected async rejectOpen(requestOrAcceptEvent: ChannelOpenAcceptanceEvent | ChannelOpenConfirmationEvent) {
    const promise = this._openPromises.get(this.cid);
    try {
      const rejectEvent: ChannelOpenRejectionEvent = await this.createEvent(ChannelEventType.OPEN_REJECTION, requestOrAcceptEvent);
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
   * - to be overridden by user via extending classes
   * - if not overridden, will resolve the acceptance
   * - resolving triggers confirmOpen
   * - rejecting triggers rejectOpen
   */
  protected handleOpenAccepted: HandleOpenAccepted = ({ event, resolve, reject }) => {
    return resolve();
  }

  /**
   * @description Handles inbound channel open acceptances
   * - sets up callbacks and passes data to handleOpenAccepted
   * @param {ChannelOpenAcceptanceEvent} acceptanceEvent
   * @throws {ON_OPEN_ACCEPTED_ERROR} 
   */
  private async onOpenAccepted(acceptanceEvent: ChannelOpenAcceptanceEvent) {
    try {
      const promise = this._openPromises.get(this.cid);
      if (!promise) throw new Error("Open promise not found");
      this.handleOpenAccepted({
        event: acceptanceEvent,
        resolve: this.confirmOpen.bind(this, acceptanceEvent),
        reject: this.rejectOpen.bind(this, acceptanceEvent),
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
  protected async confirmOpen(acceptanceEvent: ChannelOpenAcceptanceEvent) {
    return new Promise(async (_resolve, _reject) => {
      const promise = this._openPromises.get(this.cid);
      try {
        await this.setPeer(acceptanceEvent);
        const event: ChannelOpenConfirmationEvent = await this.createEvent(ChannelEventType.OPEN_CONFIRMATION, acceptanceEvent);
        const validReciept: ChannelOpenAcceptanceReceipt = await this.openReceiptDigest(ChannelReceiptType.OPEN_ACCEPTED, acceptanceEvent.data.receipt);
        if (!validReciept) throw new Error("Invalid acceptance receipt");
        if (!promise) throw new Error("Open promise not found");
        this._sendRequest(event);
        this._openPromises.delete(this.cid);
        this.status = ChannelState.OPENED;
        promise.resolve(this);
        _resolve(this);
        this._openPromises.delete(this.cid);
      } catch (error) {
        const sparkError = ChannelErrors.ConfirmOpenError(error);
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
  private async onOpenConfirmed(confirmEvent: ChannelOpenConfirmationEvent) {
    const promise = this._openPromises.get(this.cid);
    try {
      const validReciept: ChannelOpenConfirmationReceipt = await this.openReceiptDigest(ChannelReceiptType.OPEN_CONFIRMED, confirmEvent.data.receipt);
      if (!validReciept) throw new Error("Invalid confirmation receipt");
      if (!promise) throw new Error("Open promise not found");
      this.status = ChannelState.OPENED;
      promise.resolve(this);
      this._openPromises.delete(this.cid);
    } catch (error) {
      const sparkError = ChannelErrors.OpenConfirmedError(error);
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
  private async onOpenRejected(rejectEvent: ChannelOpenRejectionEvent) {
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

  public close(): Promise<ChannelCloseConfirmationEvent | SparkError> {
    return new Promise(async (_resolve, _reject) => {
      try {
        const resolve = _resolve as ResolveClosePromise;
        const reject = _reject as RejectPromise;
        this._closePromises.set(this.cid, { resolve, reject });
        const event: ChannelCloseEvent = await this.createEvent(ChannelEventType.CLOSE, null);
        this._sendRequest(event);
      } catch (error) {
        this._closePromises.delete(this.cid);
        return _reject(ChannelErrors.OpenRequestError(error));
      }
    })
  }

  private async onClosed(closeEvent: ChannelCloseEvent) {
    try {
      const event: ChannelCloseConfirmationEvent = await this.createEvent(ChannelEventType.CLOSE_CONFIRMATION, closeEvent);
      this._sendRequest(event);
      this.closeChannel();
      if (this.onclose) this.onclose(closeEvent);
    } catch (error) {
      const sparkError = ChannelErrors.OnClosedError(error);
      return Promise.reject(sparkError);
    }
  }

  private async onCloseConfirmed(confirmEvent: ChannelCloseConfirmationEvent) {
    const promise = this._closePromises.get(this.cid);
    try {
      const validReciept: ChannelCloseConfirmationReceipt = await this.openReceiptDigest(ChannelReceiptType.CLOSE_CONFIRMED, confirmEvent.data.receipt);
      if (!validReciept) throw new Error("Invalid confirmation receipt");
      if (!promise) throw new Error("Close promise not found");
      promise.resolve(confirmEvent);
      this._closePromises.delete(this.cid);
      this.closeChannel();
    } catch (error) {
      const sparkError = ChannelErrors.OnCloseConfirmedError(error);
      if (promise) {
        promise.reject(sparkError);
        this._closePromises.delete(this.cid);
      }
      return Promise.reject(sparkError);
    }
  }

  private closeChannel() {
    this.status = ChannelState.CLOSED;
    this._openPromises.delete(this.cid);
    this._closePromises.delete(this.cid);
    this._messagePromises.clear();
    this._messageQueue = null;
    this.peer = null;
    this.sharedKey = null;
  }

  public message(data) {
    return new Promise(async (_resolve, _reject) => {
      try {
        if (this.status !== ChannelState.OPENED) {
          throw new Error("Channel is not open");
        }
        const resolve = _resolve as ResolveMessagePromise;
        const reject = _reject as RejectPromise;
        const event: ChannelMessageEvent = await this.createEvent(ChannelEventType.MESSAGE, { data });
        this._messagePromises.set(event.metadata.mid, { resolve, reject });
        this._sendRequest(event);
      } catch (error) {
        return _reject(ChannelErrors.MessageSendingError(error));
      }
    })
  }
  private async onMessage(messageEvent: ChannelMessageEvent) {
    try {
      const message = await this.openMessageDigest(messageEvent.data);
      const decryptedEvent: ChannelDecryptedMessageEvent = { ...messageEvent, data: message }
      const event: ChannelMessageConfirmationEvent = await this.createEvent(ChannelEventType.MESSAGE_CONFIRMATION, decryptedEvent);
      if (this.onmessage) this.onmessage(decryptedEvent);
      this._sendRequest(event);
    } catch (error) {
      const sparkError = ChannelErrors.OnMessageError(error);
      return Promise.reject(sparkError);
    }
  }
  private async onMessageConfirmed(confirmEvent: ChannelMessageConfirmationEvent) {
    const promise = this._messagePromises.get(confirmEvent.metadata.mid);
    try {
      const validReciept: ChannelMessageReceivedReceipt = await this.openReceiptDigest(ChannelReceiptType.MESSAGE_RECEIVED, confirmEvent.data.receipt);
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

  protected abstract sendRequest(event: AnyChannelEvent): Promise<void>;
  private _sendRequest(event: AnyChannelEvent): Promise<void> {
    try {
      if (!this.sendRequest) throw new Error("sendRequest method not implemented");
      const result = this.sendRequest(event);
      this.eventLog.push({ request: true, ...event });
      return result;
    } catch (error) {
      const sparkError = ChannelErrors.HandleRequestError(error);
      return Promise.reject(sparkError);
    }
  }

  protected handleResponse(event: AnyChannelEvent): Promise<any> {
    const { type } = event;

    const isEvent = Object.values(ChannelEventType).includes(type);
    if (isEvent) this.eventLog.push({ response: true, ...event });
    switch (type) {
      case ChannelEventType.OPEN_REQUEST:
        return this.onOpenRequested(event as ChannelOpenRequestEvent);
      case ChannelEventType.OPEN_ACCEPTANCE:
        return this.onOpenAccepted(event as ChannelOpenAcceptanceEvent);
      case ChannelEventType.OPEN_CONFIRMATION:
        return this.onOpenConfirmed(event as ChannelOpenConfirmationEvent);
      case ChannelEventType.OPEN_REJECTION:
        return this.onOpenRejected(event as ChannelOpenRejectionEvent);
      case ChannelEventType.CLOSE:
        return this.onClosed(event as ChannelCloseEvent);
      case ChannelEventType.CLOSE_CONFIRMATION:
        return this.onCloseConfirmed(event as ChannelCloseConfirmationEvent);
      case ChannelEventType.MESSAGE:
        return this.onMessage(event as ChannelMessageEvent);
      case ChannelEventType.MESSAGE_CONFIRMATION:
        return this.onMessageConfirmed(event as ChannelMessageConfirmationEvent);
      case ChannelEventType.CHANNEL_ERROR:
        if (this.onerror) {
          this.onerror(event as ChannelErrorEvent);
        }
      default:
        break;
    }
  }
}

