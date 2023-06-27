
import { Spark } from "../Spark";
import cuid from "cuid";
import { PublicKeys } from "../types";
import { Identifier } from "../controller/types";
import { utcEpochTimestamp } from "../common";
import { ChannelId, ChannelMessageId, ChannelPeer, ChannelState, ResolveClosePromise, ResolveMessagePromise, ResolveOpenPromise } from "./types";
import { EncryptionSharedKey } from "../cipher/types";
import { AnyChannelEvent, ChannelCloseConfirmationEvent, ChannelEventLog, ChannelEventType, ChannelMessageEvent, ChannelOpenRequestEvent } from "./ChannelEvent";
import { ChannelReceiptType } from "./ChannelReceipt";

export abstract class ChannelCore {
  // opens and resolves/rejects on both sides
  private _openPromises: Map<ChannelId, ResolveOpenPromise>;

  // opens and resolves/rejects only on initiator side
  private _closePromises: Map<ChannelId, ResolveClosePromise>;
  private _messagePromises: Map<ChannelMessageId, ResolveMessagePromise>;

  // queue messages that come in before the complete open call
  private _messageQueue: any;

  // commit to next event id to keep a logical chain of events (so event omittions can be detected)
  private _nextEventId: string;

  // spark instance
  protected _spark: Spark<any, any, any, any, any>;

  // channel properties
  public cid: ChannelId;
  public peer: ChannelPeer;
  public sharedKey: EncryptionSharedKey;
  public status: ChannelState;
  public events: ChannelEventLog;

  // event callbacks for receivers only
  public onopen: (payload: any) => void | never;
  public onmessage: (payload: any) => void | never;
  public onclose: (payload: any) => void | never;
  public onerror: (payload: any) => void | never;

  constructor(spark: Spark<any, any, any, any, any>) {
    this._spark = spark;
    this.cid = cuid();
    this._nextEventId = cuid.slug();
  }

  private async generateReceipt(type: ChannelReceiptType, prev: AnyChannelEvent): Promise<ChannelReceiptType | null> {
    try {

      const { payload = {}, metadata = {} } = prev as any || {};
      const ourInfo = { identifier: this._spark.identifier, publicKeys: this._spark.publicKeys };
      const theirInfo = { identifier: payload?.identifier, publicKeys: payload?.publicKeys };
      const sharedKey = this.sharedKey;
      const peers = [ourInfo, theirInfo];

      const eventEncrypted = await this._spark.encrypt({ data: prev, sharedKey });
      const eventSealed = await this._spark.seal({ data: eventEncrypted });

      let receipt: ChannelReceipt;
      switch (prev.type) {
        case ChannelEventType.OPEN_REQUEST:
          receipt = {
            type: ChannelReceiptType.OPEN_ACCEPTED,
            peers: peers,
            eventDigest: eventSealed,
          };
          break;
        case ChannelEventType.OPEN_ACCEPTANCE:
          receipt = {
            type: ChannelReceiptType.OPEN_CONFIRMED,
            peers: peers,
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
      return Promise.reject(error);
    }
  }

  private async generateEvent(type: ChannelEventType, prev: AnyChannelEvent): Promise<AnyChannelEvent | null> {
    try {
      const { payload = {}, metadata = {} } = prev as any || {};
      const cid = this.cid;
      const mid = metadata?.nmid || cuid.slug();
      const eid = metadata?.neid || cuid.slug();
      const neid = cuid.slug();
      const timestamp = utcEpochTimestamp();
      const { receipt } = payload;
      const ourInfo = { identifier: this._spark.identifier, publicKeys: this._spark.publicKeys };
      const theirInfo = { identifier: payload?.identifier, publicKeys: payload?.publicKeys };
      const sharedKey = this.sharedKey;

      let outgoingEvent: AnyChannelEvent;
      switch (type) {
        case ChannelEventType.OPEN_REQUEST:
          outgoingEvent = {
            type: ChannelEventType.OPEN_REQUEST,
            timestamp,
            payload: {
              identifier: ourInfo.identifier,
              publicKeys: ourInfo.publicKeys,
            },
            metadata: { eid, cid, neid },
          };
          break;
        case ChannelEventType.OPEN_ACCEPTANCE:
          outgoingEvent = {
            type: ChannelEventType.OPEN_ACCEPTANCE,
            timestamp,
            payload: {
              identifier: theirInfo.identifier,
              publicKeys: theirInfo.publicKeys,
              receipt: await this.generateReceipt(ChannelReceiptType.OPEN_ACCEPTED, prev)
            },
            metadata: { eid, cid, neid },
          };
          break;
        case ChannelEventType.OPEN_CONFIRMATION:
          outgoingEvent = {
            type: ChannelEventType.OPEN_CONFIRMATION,
            timestamp,
            payload: {
              receipt: await this.generateReceipt(ChannelReceiptType.OPEN_CONFIRMED, prev),
            },
            metadata: { eid, cid, neid }
          };
          break;
        case ChannelEventType.OPEN_REJECTION:
          outgoingEvent = {
            type: ChannelEventType.OPEN_REJECTION,
            timestamp,
            payload: {},
            metadata: { eid, cid, neid },
          };
          break;
        case ChannelEventType.CLOSE:
          outgoingEvent = {
            type: ChannelEventType.CLOSE,
            timestamp,
            payload: {},
            metadata: { eid, cid, neid },
          };
          break;
        case ChannelEventType.CLOSE_CONFIRMATION:
          outgoingEvent = {
            type: ChannelEventType.CLOSE_CONFIRMATION,
            timestamp,
            payload: {},
            metadata: { eid, cid, neid },
          } as ChannelCloseConfirmationEvent;
          break;
        case ChannelEventType.MESSAGE:
          outgoingEvent = {
            type: ChannelEventType.MESSAGE,
            timestamp,
            payload: {},
            metadata: { eid, cid, neid, mid },
          } as ChannelMessageEvent;
          break;
        case ChannelEventType.MESSAGE_CONFIRMATION:
          outgoingEvent = {
            type: ChannelEventType.MESSAGE_CONFIRMATION,
            timestamp,
            payload: {
              receipt: await this.generateReceipt(ChannelReceiptType.MESSAGE_RECEIVED, prev),
            },
            metadata: { eid, cid, neid, mid },
          };
          break;
        default:
          return null; // Event type not supported
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }


  // send a request event to the peer
  public async open(): Promise<ChannelOpenConfirmationEvent | SparkError> {
    return new Promise((resolve) => {
      this._openPromises.set(this.cid, resolve as ResolveOpenPromise);

      const publicKeys = this._spark.publicKeys as PublicKeys;
      const identifier = this._spark.identifier as Identifier;

      const event: ChannelOpenRequestEvent = {
        type: ChannelEventType.OPEN_REQUEST,
        timestamp: utcEpochTimestamp(),
        payload: {
          identifier: identifier,
          publicKeys: publicKeys,
        },
        metadata: {
          cid: this.cid,
          eid: this.eventId(),
          neid: this.nextEventId(),
        },
      };

      const requestSent = this.handleRequest(event);

      const errors = SparkError.get(publicKeys, identifier, requestSent);
      if (errors) {
        this._openPromises.delete(this.cid);
        return resolve(errors);
      }
    })
  }

  // requestEvent recieved: callback then trigger acceptOpen or rejectOpen
  public static onOpenRequested: OnOpenRequested;

  // requestEvent approved => create a receipt and send'er back
  protected async acceptOpen(requestEvent: ChannelOpenRequestEvent): Promise<void | SparkError> {
    const { payload, metadata } = requestEvent;
    const peersSet = await this.setPeer(requestEvent);
    const receiptDigest = await this.sealReceiptData(requestEvent) as ChannelReceiptDigest;
    const ourIdentifier = this._spark.identifier as Identifier;
    const ourPublicKeys = this._spark.publicKeys as PublicKeys;

    const event: ChannelOpenAcceptanceEvent = {
      type: ChannelEventType.OPEN_ACCEPTANCE,
      timestamp: utcEpochTimestamp(),
      payload: {
        identifier: ourIdentifier,
        publicKeys: ourPublicKeys,
        receipt: receiptDigest,
      },
      metadata: {
        cid: metadata.cid,
        eid: this.eventId(),
        neid: this.nextEventId(),
      },
    };

    const requestSent = await this.handleRequest(event) as SparkError;
    const errors = SparkError.get(ourPublicKeys, ourIdentifier, peersSet, receiptDigest, requestSent);
    if (errors) return errors;
  }

  // requestEvent rejected => send a rejection event and close out if there's a promise
  protected rejectOpen(requestOrAcceptEvent: ChannelOpenAcceptanceEvent | ChannelOpenConfirmationEvent) {
    const rejectEvent: ChannelOpenRejectionEvent = {
      type: ChannelEventType.OPEN_REJECTION,
      timestamp: utcEpochTimestamp(),
      metadata: {
        cid: requestOrAcceptEvent.metadata.cid,
        eid: this.eventId(),
        neid: this.nextEventId(),
      },
    };

    this.handleRequest(rejectEvent);
    if (this._openPromises.has(this.cid)) {
      const promise = this._openPromises.get(this.cid);
      promise(rejectEvent);
    }
  }

  // acceptedEvent => callback then trigger confirmOpen or rejectOpen
  public static onOpenAccepted: OnOpenAccepted;

  // TODO - HERE, wip - shared key, receipt validation, etc
  protected async confirmOpen(acceptanceEvent: ChannelOpenAcceptanceEvent) {

    const { payload, metadata } = acceptanceEvent;
    const hashedEvent = await this._spark.hash({ data: acceptanceEvent });
    const eventDigest = await this._spark.sign({ data: hashedEvent });

    const publicKeys = this._spark.publicKeys as PublicKeys;
    const identifier = this._spark.identifier as Identifier;

    const peerPublicKeys = payload.publicKeys as PublicKeys;
    const peerIdentifier = payload.identifier as Identifier;

    const receipt: ChannelOpenConfirmationReceipt = {
      type: ChannelReceiptType.OPEN_CONFIRMED,
      eventDigest: eventDigest,
      peers: [
        { identifier: identifier, publicKeys: publicKeys },
        { identifier: peerIdentifier, publicKeys: peerPublicKeys },
      ],
    };

    const receiptHash = await this._spark.hash({ data: receipt });
    const signedReceiptHash = await this._spark.sign({ data: receiptHash });

    const event: ChannelOpenConfirmationEvent = {
      type: ChannelEventType.OPEN_CONFIRMATION,
      timestamp: utcEpochTimestamp(),
      metadata: {
        cid: metadata.cid,
        eid: this.eventId(),
        neid: this.nextEventId(),
      },
      payload: {
        receipt: signedReceiptHash,
      },
    };

    this.handleRequest(event);
  }

  // completes open
  private openConfirmed(confirmedOpenEvent: ChannelOpenConfirmationEvent) {
    // check the receipt and resolve the promise
    const { payload, metadata } = confirmedOpenEvent;
    const receiptDigest = confirmedOpenEvent.payload.receipt;
    const openedReceipt = this._spark.open({ signature: receiptDigest, publicKey: 'test' });
  }

  private openRejected() { }     // completes open
  private completeOpen() { }     // completes open

  public close() { }
  private onClosed() { }
  private onCloseConfirmed() { }
  private confirmClose() { }
  private completeClose() { }

  public message() { }
  private onMessage() { }
  private onMessageConfirmed() { }
  private confirmMessage() { }
  private completeMessage() { }

  public abstract handleRequest(event: ChannelEvent | SparkError): Promise<void | SparkError>;
  public abstract handleResponse(): Promise<void | never>;

  // fires only on receiving side, initiator gets promise receipts instead
  private _onMessage = (payload: any) => { };
  private _onClose = (payload: any) => { };

  // fires on both sides for central error handling
  private _onError = (error: SparkError) => {
    if (this.onerror) this.onerror(error);
  };
}

