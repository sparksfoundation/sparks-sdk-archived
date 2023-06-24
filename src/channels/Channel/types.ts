import { ISpark } from "../../Spark";
import { SharedEncryptionKey } from "../../ciphers";
import { Identifier, PublicKeys } from "../../controllers";
import { Channel } from "./Channel";

/**
 * TODO - allow decoration of request/response payloads from request/response handlers
 * TODO - allow decoration of peer definition from constructor
 */

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
      data: Message.Data,
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
      MESSAGE = 'MESSAGE',
      MESSAGE_CONFIRM = 'MESSAGE_CONFIRM',
      CLOSE = 'CLOSE',
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

    export type Message = Meta & {
      mid: Mid,
      type: Types.MESSAGE,
      ciphertext: Message.Cipher,
    }

    export type MessageConfirm = Meta & {
      mid: Mid,
      type: Types.MESSAGE_CONFIRM,
      receipt: Receipt.Cipher,
    }

    export type Close = Meta & {
      type: Types.CLOSE,
    }

    export type CloseConfirm = Meta & {
      type: Types.CLOSE_CONFIRM,
      receipt: Receipt.Cipher,
    }

    export type All = {
      [Types.OPEN_REQUEST]: OpenRequest,
      [Types.OPEN_ACCEPT]: OpenAccept,
      [Types.OPEN_CONFIRM]: OpenConfirm,
      [Types.MESSAGE]: Message,
      [Types.MESSAGE_CONFIRM]: MessageConfirm,
      [Types.CLOSE]: Close,
      [Types.CLOSE_CONFIRM]: CloseConfirm,
    }

    export type Any = OpenRequest | OpenAccept | OpenConfirm | Message | MessageConfirm | Close | CloseConfirm;
  }

  export namespace Message {
    export type Data = string | Record<string, any>;
    export type Cipher = string;

    export type Handler = ({
      event,
      data
    }: {
      event: SparksChannel.Event.Message | SparksChannel.Event.MessageConfirm,
      data: Data
    }) => void
  }

  export namespace Error {
    export type Message = string;

    export type Handler = ({
      error,
    }: {
      error: SparksChannel.Error.Any,
    }) => void

    export enum Types {
      SEND_REQUEST_ERROR = 'SEND_REQUEST_ERROR', // failed to send a request
      EVENT_PROMISE_ERROR = 'EVENT_PROMISE_ERROR', // missing event promise
      SHARED_KEY_CREATION_ERROR = 'SHARED_KEY_CREATION_ERROR', // failed to create a shared key
      OPEN_REQUEST_REJECTED = 'OPEN_REQUEST_REJECTED', // open request was rejected
      COMPUTE_SHARED_KEY_ERROR = 'COMPUTE_SHARED_KEY_ERROR', // failed to compute a shared key
      UNEXPECTED_ERROR = 'UNEXPECTED_ERROR', // unexpected error
      INVALID_PUBLIC_KEYS = 'INVALID_PUBLIC_KEYS', // invalid public keys
      INVALID_IDENTIFIER = 'INVALID_IDENTIFIER', // invalid identifier
      OPEN_CIPHERTEXT_ERROR = 'OPEN_CIPHERTEXT_ERROR', // failed to open ciphertext
      CREATE_CIPHERTEXT_ERROR = 'CREATE_CIPHERTEXT_ERROR', // failed to create ciphertext
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

    export type OpenCiphertext = Meta & {
      type: Types.OPEN_CIPHERTEXT_ERROR,
    }

    export type CreateCiphertext = Meta & {
      type: Types.CREATE_CIPHERTEXT_ERROR,
    }

    export type Unexpected = Meta & {
      type: Types.UNEXPECTED_ERROR,
    }

    export type All = {
      [Types.SEND_REQUEST_ERROR]: SendRequest,
      [Types.EVENT_PROMISE_ERROR]: EventPromise,
      [Types.SHARED_KEY_CREATION_ERROR]: SharedKeyCreation,
      [Types.OPEN_REQUEST_REJECTED]: OpenRequestRejected,
      [Types.COMPUTE_SHARED_KEY_ERROR]: ComputeSharedKey,
      [Types.INVALID_PUBLIC_KEYS]: InvalidPublicKeys,
      [Types.INVALID_IDENTIFIER]: InvalidIdentifier,
      [Types.OPEN_CIPHERTEXT_ERROR]: OpenCiphertext,
      [Types.CREATE_CIPHERTEXT_ERROR]: CreateCiphertext,
      [Types.UNEXPECTED_ERROR]: Unexpected,
    }

    export type Any = SendRequest | EventPromise | SharedKeyCreation | OpenRequestRejected | Unexpected | ComputeSharedKey | InvalidPublicKeys | InvalidIdentifier | OpenCiphertext | CreateCiphertext;
  }

  export namespace Close {
    export type Handler = ({
      event,
    }: {
      event: SparksChannel.Event.Close | SparksChannel.Event.CloseConfirm,
    }) => void
  }

  export namespace Open {
    export type Handler = ({
      event,
    }: {
      event: SparksChannel.Event.OpenRequest | SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenConfirm,
    }) => void
  }

  export type RequestHandler = (event: Event.Any | Error.Any) => Promise<void> | never
}

export abstract class AChannel {
  protected spark: ISpark<any, any, any, any, any>;
  protected channel: Channel;
  public onmessage: SparksChannel.Message.Handler;
  public onerror: SparksChannel.Error.Handler;
  public onclose: SparksChannel.Close.Handler;
  public onopen: SparksChannel.Open.Handler;
  constructor({ spark, channel }: { spark: ISpark<any, any, any, any, any>, channel?: Channel }) {
    this.spark = spark;
    this.channel = channel || new Channel({ spark });
    Object.defineProperties(this, {
      spark: { enumerable: false },
      channel: { enumerable: false },
    });

    this.channel.setMessageHandler((payload) => {
      if (this.onmessage) this.onmessage(payload);
    });

    this.channel.setErrorHandler((payload) => {
      if (this.onerror) this.onerror(payload);
    });

    this.channel.setCloseHandler((payload) => {
      if (this.onclose) this.onclose(payload);
    });

    this.channel.setOpenHandler((payload) => {
      if (this.onopen) this.onopen(payload);
    });
  }

  public get cid(): SparksChannel.Cid {
    return this.channel.cid;
  }

  public get peer(): SparksChannel.Peer {
    return this.channel.peer;
  }

  public get eventLog(): SparksChannel.EventLog {
    return this.channel.eventLog;
  }

  public get opened(): boolean {
    return this.channel.opened;
  }

  public get sharedKey(): SparksChannel.SharedKey {
    return this.channel.sharedKey;
  }

  public open() {
    return this.channel.open();
  }

  public close() {
    return this.channel.close();
  }

  public send(message) {
    return this.channel.send(message);
  }

  protected acceptOpen(request) {
    return this.channel.acceptOpen(request);
  }

  protected rejectOpen(request) {
    return this.channel.rejectOpen(request);
  }

  protected abstract handleResponse(response?: any): any | never;
  protected abstract handleRequest(request: SparksChannel.Event.Any): Promise<void | never>;
}