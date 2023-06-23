import { ISpark } from "../../Spark";
import { SharedEncryptionKey } from "../../ciphers";
import { Identifier, PublicKeys } from "../../controllers";
import { Channel } from "./Channel";

export namespace SparksChannel {
  export type Cid = string;
  export type Eid = string;
  export type Mid = string;
  export type Timestamp = number;
  export type SharedKey = SharedEncryptionKey;
  export type Peer = { identifier: Identifier, publicKeys: PublicKeys };
  export type Peers = [Peer, Peer];
  export type EventLog = any[]

  export namespace Receipt {
    export type Cipher = string;

    export enum Types {
      OPEN_ACCEPTED = 'OPEN_ACCEPTED',
      OPEN_CONFIRMED = 'OPEN_CONFIRMED',
      MESSAGE_CONFIRMED = 'MESSAGE_CONFIRMED',
      CLOSE_CONFIRMED = 'CLOSE_CONFIRMED',
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
      type: Types.MESSAGE_CONFIRMED,
      mid: Mid,
      payload: Message.Payload,
    }

    export type CloseConfirmed = Meta & {
      type: Types.CLOSE_CONFIRMED,
    }
    
    export type All = {
      [Types.OPEN_ACCEPTED]: OpenAccepted,
      [Types.OPEN_CONFIRMED]: OpenConfirmed,
      [Types.MESSAGE_CONFIRMED]: MessageConfirmed,
      [Types.CLOSE_CONFIRMED]: CloseConfirmed,
    }

    // SparkChannel.Events that have receipts in their type
    export type Events = SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenConfirm | SparksChannel.Event.MessageConfirm | SparksChannel.Event.CloseConfirm;

    export type Any = OpenAccepted | OpenConfirmed | MessageConfirmed | CloseConfirmed;
  }

  export namespace Event {

    export type Promise = {
      resolve: (args?: any) => any,
      reject: (args?: any) => any,
    };

    export enum Types {
      OPEN_REQUEST = 'OPEN_REQUEST',
      OPEN_ACCEPT = 'OPEN_ACCEPT',
      OPEN_CONFIRM = 'OPEN_CONFIRM',
      MESSAGE_REQUEST = 'MESSAGE_REQUEST',
      MESSAGE_CONFIRM = 'MESSAGE_CONFIRM',
      CLOSE_REQUEST = 'CLOSE_REQUEST',
      CLOSE_CONFIRM = 'CLOSE_CONFIRM',
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

    export type CloseRequest = Meta & {
      type: Types.CLOSE_REQUEST,
    }

    export type CloseConfirm = Meta & {
      type: Types.CLOSE_CONFIRM,
      receipt: Receipt.Cipher,
    }

    export type All = {
      [Types.OPEN_REQUEST]: OpenRequest,
      [Types.OPEN_ACCEPT]: OpenAccept,
      [Types.OPEN_CONFIRM]: OpenConfirm,
      [Types.MESSAGE_REQUEST]: MessageRequest,
      [Types.MESSAGE_CONFIRM]: MessageConfirm,
      [Types.CLOSE_REQUEST]: CloseRequest,
      [Types.CLOSE_CONFIRM]: CloseConfirm,
    }

    export type Any = OpenRequest | OpenAccept | OpenConfirm | MessageRequest | MessageConfirm | CloseRequest | CloseConfirm;
  }

  export namespace Message {
    export type Payload = string | Record<string, any>;

    export type Result = {

      payload: Payload,
      receipt: Receipt.Cipher,
    }
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
      COMPUTE_SHARED_KEY_ERROR = 'COMPUTE_SHARED_KEY_ERROR', // failed to compute a shared key
      UNEXPECTED_ERROR = 'UNEXPECTED_ERROR', // unexpected error
      INVALID_PUBLIC_KEYS = 'INVALID_PUBLIC_KEYS', // invalid public keys
      INVALID_IDENTIFIER = 'INVALID_IDENTIFIER', // invalid identifier
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

    export type ComputeSharedKey = Meta & {
      type: Types.COMPUTE_SHARED_KEY_ERROR,
    }

    export type InvalidPublicKeys = Meta & {
      type: Types.INVALID_PUBLIC_KEYS,
    }

    export type InvalidIdentifier = Meta & {
      type: Types.INVALID_IDENTIFIER,
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
      [Types.COMPUTE_SHARED_KEY_ERROR]: ComputeSharedKey,
      [Types.INVALID_PUBLIC_KEYS]: InvalidPublicKeys,
      [Types.INVALID_IDENTIFIER]: InvalidIdentifier,
      [Types.UNEXPECTED_ERROR]: Unexpected,
    }

    export type Any = SendRequest | EventPromise | ReceiptCreation | ReceiptVerification | SharedKeyCreation | OpenRequestRejected | Unexpected | ComputeSharedKey | InvalidPublicKeys | InvalidIdentifier;
  }

  export type RequestHandler = (event: Event.Any | Error.Any) => Promise<void> | never
}

export abstract class AChannel {
  protected spark: ISpark<any, any, any, any, any>;
  protected channel: Channel;
  constructor(spark) {
    this.spark = spark;
    this.channel = new Channel(spark);
    Object.defineProperties(this, {
      spark: { enumerable: false },
      channel: { enumerable: false },
    })
  }

  protected get cid(): SparksChannel.Cid {
    return this.channel.cid;
  }

  protected get peer(): SparksChannel.Peer {
    return this.channel.peer;
  }

  protected get eventLog(): SparksChannel.EventLog {
    return this.channel.eventLog;
  }

  protected get opened(): boolean {
    return this.channel.opened;
  }

  protected open() {
    return this.channel.open();
  }

  protected close() {
    return this.channel.close();
  }

  protected send(message) {
    return this.channel.send(message);
  }

  protected acceptOpen(request) {
    return this.channel.acceptOpen(request); 
  }

  protected rejectOpen(request) {
    return this.channel.rejectOpen(request);
  }

  protected abstract sendRequest(request: SparksChannel.Event.Any): Promise<void | never>;
  protected abstract handleResponse(response?: any): any | never;
}