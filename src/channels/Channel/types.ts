import { ISpark } from "../../Spark";
import { Identifier, PublicKeys } from "../../controllers";
import { Channel } from "./Channel";

export namespace SparksChannel {
  export type Cid = string;
  export type Eid = string;
  export type Mid = string;
  export type Timestamp = number;
  export type EventMessage = string;
  export type ErrorMessage = string;
  export type Receipt = string;
  export type Peer = { identifier: Identifier, publicKeys: PublicKeys };
  export type Peers = [ Peer, Peer ];

  export enum EventTypes {
    OPEN_REQUEST = 'OPEN_REQUEST',
    OPEN_ACCEPT = 'OPEN_ACCEPT',
    OPEN_CONFIRM = 'OPEN_CONFIRM',
  }

  export type ChannelEventMeta = {
    eid: Eid,
    cid: Cid,
    timestamp: Timestamp,
  }

  export type OpenRequestEvent = ChannelEventMeta & {
    eid: Eid,
    cid: Cid,
    timestamp: Timestamp,
    type: EventTypes.OPEN_REQUEST,
    identifier: Identifier,
    publicKeys: PublicKeys,
  }

  export type OpenAcceptEvent = ChannelEventMeta & {
    eid: Eid,
    cid: Cid,
    timestamp: Timestamp,
    type: EventTypes.OPEN_ACCEPT,
    identifier: Identifier,
    publicKeys: PublicKeys,
    receipt: Receipt,
  }

  export type OpenConfirmEvent = ChannelEventMeta & {
    eid: Eid,
    cid: Cid,
    timestamp: Timestamp,
    type: EventTypes.OPEN_CONFIRM,
    receipt: Receipt,
    identifier: Identifier,
    publicKeys: PublicKeys,
  }

  export type ChannelEvents = OpenRequestEvent | OpenAcceptEvent | OpenConfirmEvent;

  export enum ErrorTypes {
    OPEN_REQUEST_FAILED = 'OPEN_REQUEST_FAILED',
    OPEN_REQUEST_REJECTED = 'OPEN_REQUEST_REJECTED',
    OPEN_CONFIRM_FAILED = 'OPEN_CONFIRM_FAILED',
    RECEIPT_CREATION_FAILED = 'RECEIPT_CREATION_FAILED',
    RECEIPT_VERIFICATION_FAILED = 'RECEIPT_VERIFICATION_FAILED',
    OPEN_ACCEPT_FAILED = 'OPEN_ACCEPT_FAILED',
    OPEN_ACCEPT_REJECTED = 'OPEN_ACCEPT_REJECTED',
    CHANNEL_ERROR = 'CHANNEL_ERROR',
  }

  export type Error = {
    type: ErrorTypes,
    cid: Cid,
    eid: Eid,
    timestamp: Timestamp,
    message: ErrorMessage,
  }

  export type Errors = {
    OPEN_REQUEST_REJECTED: Error & {
      type: ErrorTypes.OPEN_REQUEST_REJECTED,
    }
    OPEN_REQUEST_FAILED: Error & {
      type: ErrorTypes.OPEN_REQUEST_FAILED,
    };
    OPEN_CONFIRM_FAILED: Error & {
      type: ErrorTypes.OPEN_CONFIRM_FAILED,
    };
    RECEIPT_CREATION_FAILED: Error & {
      type: ErrorTypes.RECEIPT_CREATION_FAILED,
    };
    RECEIPT_VERIFICATION_FAILED: Error & {
      type: ErrorTypes.RECEIPT_VERIFICATION_FAILED,
    };
    OPEN_ACCEPT_FAILED: Error & {
      type: ErrorTypes.OPEN_ACCEPT_FAILED,
    };
    OPEN_ACCEPT_REJECTED: Error & {
      type: ErrorTypes.OPEN_ACCEPT_REJECTED,
    };
    CHANNEL_ERROR: Error & {
      type: ErrorTypes.CHANNEL_ERROR,
    };
  }

  export enum ReceiptTypes {
    OPEN_CONFIRMED = 'OPEN_CONFIRMED',
  }

  export type ReceiptMeta = {
    cid: Cid,
    timestamp: Timestamp,
  }

  export type Receipts = {
    OPEN_CONFIRMED: ReceiptMeta & {
      type: ReceiptTypes.OPEN_CONFIRMED,
      peers: Peers,
    }
  }
}

export abstract class AChannel {
  protected spark: ISpark<any, any, any, any, any>;
  protected channel: Channel;
  constructor(spark) {
    this.spark = spark;
    this.channel = new Channel(spark);
  }

  protected get cid(): SparksChannel.Cid {
    return this.channel.cid;
  }

  protected get peer(): SparksChannel.Peer {
    return this.channel.peer;
  }

  protected abstract open(): void;
  protected abstract close(): void;
  protected abstract send(message: string | Record<string, any>): void;
}