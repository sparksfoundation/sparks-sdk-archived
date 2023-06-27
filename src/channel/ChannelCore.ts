
import { Spark } from "../Spark";
import cuid from "cuid";
import { SparkError } from "../common/errors";
import { PublicKeys } from "../types";
import { Identifier } from "../controller/types";
import { utcEpochTimestamp } from "../common";
import { ChannelId, ChannelMessageId, ChannelPeer, ChannelState } from "./types";
import { OnOpenAccepted, OnOpenRequested, ResolveClosePromise, ResolveMessagePromise, ResolveOpenPromise } from "./types/methods";
import { ChannelEvent, ChannelEventLog, ChannelEventType, ChannelOpenAcceptanceEvent, ChannelOpenConfirmationEvent, ChannelOpenRejectionEvent, ChannelOpenRequestEvent, ChannelReceiptEvents } from "./types/events";
import { ChannelOpenAcceptanceReceipt, ChannelOpenConfirmationReceipt, ChannelReceipt, ChannelReceiptDigest, ChannelReceiptType } from "./types/receipts";
import { EncryptionSharedKey } from "../cipher/types";

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

  // helpers
  private async setPeer(requestOrAcceptEvent: ChannelOpenRequestEvent | ChannelOpenAcceptanceEvent): Promise<void | SparkError> {
    try {
      const { payload } = requestOrAcceptEvent;
      const identifier = payload.identifier as Identifier;
      if (!identifier) throw new Error('missing identifier');

      const publicKeys = payload.publicKeys as PublicKeys;

      const encryptionPublicKey = publicKeys.encryption;
      if (!encryptionPublicKey) throw new Error('missing encryptionPublicKey')

      const signingPublicKey = publicKeys.signing;
      if (!signingPublicKey) throw new Error('missing signingPublicKey');

      const sharedKey = await this._spark.generateSharedEncryptionKey({ publicKey: encryptionPublicKey });
      if (SparkError.is(sharedKey)) throw sharedKey;

      this.peer = { identifier, publicKeys };
      this.sharedKey = sharedKey;
    } catch (error) {
      return errors.InvalidPeerInfo(error.message);
    }
  }

  private async openReceiptDigest(acceptOrConfirmEvent: ChannelReceiptEvents): Promise<ChannelReceipt | SparkError> {
    const receiptDigest = acceptOrConfirmEvent.payload.receipt;
    const openedReceipt = await this._spark.open({ data: receiptDigest, publicKey: this.peer.publicKeys.signing });
    const decrypted = await this._spark.decrypt({ data: openedReceipt, sharedKey: this.sharedKey }) as ChannelReceipt;
    const openErrors = SparkError.get(this.peer.publicKeys, this.peer.identifier, receiptDigest, openedReceipt, decrypted);
    if (openErrors) return openErrors as SparkError;
  }

  private async sealReceiptData(event: ChannelOpenRequestEvent | ChannelOpenAcceptanceEvent): Promise<ChannelReceiptDigest | SparkError> {
    const { payload } = event;
    const ourIdentifier = this._spark.identifier as Identifier;
    const ourPublicKeys = this._spark.publicKeys as PublicKeys;
    const theirIdentifier = payload.identifier as Identifier;
    const theirPublicKeys = payload.publicKeys as PublicKeys;

    const hashedEvent = await this._spark.hash({ data: event })
    const encryptedEventHash = await this._spark.encrypt({ data: hashedEvent, sharedKey: this.sharedKey });
    const eventDigest = await this._spark.seal({ data: encryptedEventHash, publicKey: ourPublicKeys.encryption });

    const sealErrors = SparkError.get(ourPublicKeys, ourIdentifier, hashedEvent, encryptedEventHash, eventDigest);
    if (sealErrors) return sealErrors as SparkError;

    let receiptData;

    switch (event.type) {
      case ChannelEventType.OPEN_REQUEST:
        receiptData = {
          type: ChannelReceiptType.OPEN_ACCEPTED,
          eventDigest,
          peers: [
            { identifier: ourIdentifier, publicKeys: ourPublicKeys },
            { identifier: theirIdentifier, publicKeys: theirPublicKeys },
          ],
        } as ChannelOpenAcceptanceReceipt;
        break;
      case ChannelEventType.OPEN_ACCEPTANCE:
        receiptData = {
          type: ChannelReceiptType.OPEN_CONFIRMED,
          eventDigest,
          peers: [
            { identifier: ourIdentifier, publicKeys: ourPublicKeys },
            { identifier: theirIdentifier, publicKeys: theirPublicKeys },
          ],
        } as ChannelOpenConfirmationReceipt;
        break;
      default:
        return errors.InvalidReceiptEventType();
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

