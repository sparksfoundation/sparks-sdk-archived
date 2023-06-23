import { ISpark } from "../../Spark";
import { Identifier, PublicKeys } from "../../controllers";
import { Channel } from "./Channel";

export namespace SparksChannel {
  export type Cid = string;
  export type Eid = string;
  export type Mid = string;
  export type Timestamp = number;
  export type Peer = { identifier: Identifier, publicKeys: PublicKeys };
  export type Peers = [ Peer, Peer ];

  export namespace Receipt {
    export type Cipher = string;

    export enum Types {
      OPEN_ACCEPTED = 'OPEN_ACCEPTED',
      OPEN_CONFIRMED = 'OPEN_CONFIRMED',
      MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
    }

    export type Meta = {
      cid: Cid,
      timestamp: Timestamp,
    }

    export type OpenAccepted = Meta & {
      type: Types.OPEN_ACCEPTED,
      peers: Peers,
    }

    export type OpenConfirmed = Meta & {
      type: Types.OPEN_CONFIRMED,
      peers: Peers,
    }

    export type MessageConfirmed = Meta & {
      type: Types.MESSAGE_RECEIVED,
      mid: Mid,
      payload: Message.Payload,
    }

    export type All = {
      [Types.OPEN_ACCEPTED]: OpenAccepted,
      [Types.OPEN_CONFIRMED]: OpenConfirmed,
      [Types.MESSAGE_RECEIVED]: MessageConfirmed,
    }

    export type Events = SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenRequest | SparksChannel.Event.MessageConfirm

    export type Any = OpenAccepted | OpenConfirmed | MessageConfirmed;
  }

  export namespace Event {
    export enum Types {
      OPEN_REQUEST = 'OPEN_REQUEST',
      OPEN_ACCEPT = 'OPEN_ACCEPT',
      OPEN_CONFIRM = 'OPEN_CONFIRM',
      MESSAGE_REQUEST = 'MESSAGE_REQUEST',
      MESSAGE_CONFIRM = 'MESSAGE_CONFIRM',
    }

    export type Meta = {
      eid: Eid,
      cid: Cid,
      timestamp: Timestamp,
    }

    export type OpenRequest = Meta & {
      type: Types.OPEN_REQUEST,
      identifier: Identifier,
      publicKeys: PublicKeys,
    }
  
    export type OpenAccept = Meta & {
      type: Types.OPEN_ACCEPT,
      identifier: Identifier,
      publicKeys: PublicKeys,
      receipt: Receipt.Cipher,
    }
  
    export type OpenConfirm = Meta & {
      type: Types.OPEN_CONFIRM,
      identifier: Identifier,
      publicKeys: PublicKeys,
      receipt: Receipt.Cipher,
    }

    export type MessageRequest = Meta & {
      mid: Mid,
      type: Types.MESSAGE_REQUEST,
      payload: Message.Payload,
    }

    export type MessageConfirm = Meta & {
      mid: Mid,
      type: Types.MESSAGE_CONFIRM,
      receipt: Receipt.Cipher,
    }

    export type All = {
      [Types.OPEN_REQUEST]: OpenRequest,
      [Types.OPEN_ACCEPT]: OpenAccept,
      [Types.OPEN_CONFIRM]: OpenConfirm,
      [Types.MESSAGE_REQUEST]: MessageRequest,
      [Types.MESSAGE_CONFIRM]: MessageConfirm,
    }

    export type Any = OpenRequest | OpenAccept | OpenConfirm | MessageRequest | MessageConfirm ;
  }

  export namespace Message {
    export type Payload = string | Record<string, any>;
  }

  export namespace Error {
    export type Message = string;

    export enum Types {
      SEND_REQUEST_ERROR = 'SEND_REQUEST_ERROR', // failed to send a request
      EVENT_PROMISE_ERROR = 'EVENT_PROMISE_ERROR', // missing event promise
      RECEIPT_CREATION_ERROR = 'RECEIPT_CREATION_ERROR', // failed to create a receipt
      RECEIPT_VERIFICATION_ERROR = 'RECEIPT_VERIFICATION_ERROR', // failed to verify a receipt
      SHARED_KEY_CREATION_ERROR = 'SHARED_KEY_CREATION_ERROR', // failed to create a shared key
      OPEN_REQUEST_REJECTED = 'OPEN_REQUEST_REJECTED', // open request was rejected
      UNEXPECTED_ERROR = 'UNEXPECTED_ERROR', // unexpected error
    }

    export type Meta = {
      cid: Cid,
      eid: Eid,
      timestamp: Timestamp,
      message: Message,
    }

    export type SendRequest = Meta & {
      type: Types.SEND_REQUEST_ERROR,
    }

    export type EventPromise = Meta & {
      type: Types.EVENT_PROMISE_ERROR,
    }

    export type ReceiptCreation = Meta & {
      type: Types.RECEIPT_CREATION_ERROR,
    }

    export type ReceiptVerification = Meta & {
      type: Types.RECEIPT_VERIFICATION_ERROR,
    }

    export type SharedKeyCreation = Meta & {
      type: Types.SHARED_KEY_CREATION_ERROR,
    }

    export type OpenRequestRejected = Meta & {
      type: Types.OPEN_REQUEST_REJECTED,
    }

    export type Unexpected = Meta & {
      type: Types.UNEXPECTED_ERROR,
    }

    export type All = {
      [Types.SEND_REQUEST_ERROR]: SendRequest,
      [Types.EVENT_PROMISE_ERROR]: EventPromise,
      [Types.RECEIPT_CREATION_ERROR]: ReceiptCreation,
      [Types.RECEIPT_VERIFICATION_ERROR]: ReceiptVerification,
      [Types.SHARED_KEY_CREATION_ERROR]: SharedKeyCreation,
      [Types.OPEN_REQUEST_REJECTED]: OpenRequestRejected,
      [Types.UNEXPECTED_ERROR]: Unexpected,
    }

    export type Any = SendRequest | EventPromise | ReceiptCreation | ReceiptVerification | SharedKeyCreation | OpenRequestRejected | Unexpected;
  }

  export type RequestHandler = (event: Event.Any | Error.Any) => boolean
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