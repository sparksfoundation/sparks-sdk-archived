
import { ChannelErrorFactory } from "./errorFactory";
import { Spark } from "../Spark";
import cuid from "cuid";
import { SparkError } from "../common/errors";
import { PublicKeys } from "../types";
import { Identifier } from "../controller/types";
import { utcEpochTimestamp } from "../common";
import { ChannelId, ChannelMessageId, ChannelType } from "./types";
import { OnOpenAccepted, OnOpenRequested, ResolveClosePromise, ResolveMessagePromise, ResolveOpenPromise } from "./types/methods";
import { ChannelEventType, ChannelOpenAcceptanceEvent, ChannelOpenConfirmationEvent, ChannelOpenRejectionEvent, ChannelOpenRequestEvent } from "./types/events";
import { ChannelOpenAcceptanceReceipt, ChannelOpenConfirmationReceipt, ChannelReceiptHash, ChannelReceiptType } from "./types/receipts";
const errors = new ChannelErrorFactory(ChannelType.CHANNEL_CORE);


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
  public cid: string;
  public peer: string;
  public status: string;
  public events: any;
  public sharedKey: string;

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

  // event id rotations
  private eventId() {
    const eid = this._nextEventId;
    this._nextEventId = cuid.slug();
    return eid;
  }

  private nextEventId() {
    return this._nextEventId;
  }

  // initiator
  // > open
  // < onOpenAccepted
  // > confirmOpen | rejectOpen
  // < onpenConfirmed
  // completeOpen

  // receiver
  // < onOpenRequested
  // > acceptOpen | rejectOpen
  // < onpenConfirmed
  // > confirmOpen
  // completeOpen

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

  public static onOpenRequested: OnOpenRequested;

  protected async acceptOpen(requestEvent: ChannelOpenRequestEvent): Promise<void | SparkError> {
    const { payload, metadata } = requestEvent;
    const publicKeys = this._spark.publicKeys as PublicKeys;
    const identifier = this._spark.identifier as Identifier;

    const hashedEvent = await this._spark.hash({ data: requestEvent });
    const signedEventHash = await this._spark.sign({ data: hashedEvent });

    const receipt: ChannelOpenAcceptanceReceipt = {
      type: ChannelReceiptType.OPEN_ACCEPTED,
      eventDigest: signedEventHash,
      peers: [
        { identifier: identifier, publicKeys: publicKeys },
        { identifier: payload.identifier, publicKeys: payload.publicKeys },
      ],
    }

    const hashedReceipt = await this._spark.hash({ data: receipt });
    const signedReceiptHash = await this._spark.sign({ data: hashedReceipt });

    const event: ChannelOpenAcceptanceEvent = {
      type: ChannelEventType.OPEN_ACCEPTANCE,
      timestamp: utcEpochTimestamp(),
      payload: {
        identifier: identifier,
        publicKeys: publicKeys,
        receipt: signedReceiptHash,
      },
      metadata: {
        cid: metadata.cid,
        eid: this.eventId(),
        neid: this.nextEventId(),
      },
    };

    const requestSent = await this.handleRequest(event) as SparkError;

    const errors = SparkError.get(
      publicKeys, identifier, hashedEvent, signedEventHash,
      hashedReceipt, signedReceiptHash, requestSent
    );

    if (errors) return errors;
  }

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
  }

  public static onOpenAccepted: OnOpenAccepted;

  // TODO - HERE, wip - shared key, receipt validation, etc
  protected async confirmOpen(acceptanceEvent: ChannelOpenAcceptanceEvent) {
    try {

      const hashedEvent = await this._spark.hash({ data: acceptanceEvent });
      const eventDigest = await this._spark.sign({ data: hashedEvent });
  
      const publicKeys = this._spark.publicKeys as PublicKeys;
      const identifier = this._spark.identifier as Identifier;
  
      const peerPublicKeys = acceptanceEvent.payload.publicKeys as PublicKeys;
      const peerIdentifier = acceptanceEvent.payload.identifier as Identifier;
  
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
    } catch (error) {

    }
  }


  private openConfirmed() { }    // completes open

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

  public abstract handleRequest(event: AnyChannelEvent | ChannelError): Promise<void | SparkError>;
  public abstract handleResponse(): Promise<void | never>;

  // fires only on receiving side, initiator gets promise receipts instead
  private _onMessage = (payload: any) => { };
  private _onClose = (payload: any) => { };

  // fires on both sides for central error handling
  private _onError = (error: SparkError) => {
    if (this.onerror) this.onerror(error);
  };
}

