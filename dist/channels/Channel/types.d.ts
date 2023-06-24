import { ISpark } from "../../Spark";
import { SharedEncryptionKey } from "../../ciphers";
import { Identifier, PublicKeys } from "../../controllers";
import { Channel } from "./Channel";
/**
 * TODO - allow decoration of request/response payloads from request/response handlers
 * TODO - allow decoration of peer definition from constructor
 * TODO - flatten types to reduce nesting
 * TODO - allow for returning errors
 */
export declare namespace SparksChannel {
    type Cid = string;
    type Eid = string;
    type Mid = string;
    type Timestamp = number;
    type SharedKey = SharedEncryptionKey;
    type Peer = {
        identifier: Identifier;
        publicKeys: PublicKeys;
    };
    type Peers = [Peer, Peer];
    type EventLog = any[];
    namespace Receipt {
        type Cipher = string;
        enum Types {
            OPEN_ACCEPTED = "OPEN_ACCEPTED",
            OPEN_CONFIRMED = "OPEN_CONFIRMED",
            MESSAGE_CONFIRMED = "MESSAGE_CONFIRMED",
            CLOSE_CONFIRMED = "CLOSE_CONFIRMED"
        }
        type Meta = {
            cid: Cid;
            timestamp: Timestamp;
        };
        type OpenAccepted = Meta & {
            type: Types.OPEN_ACCEPTED;
            peers: Peers;
        };
        type OpenConfirmed = Meta & {
            type: Types.OPEN_CONFIRMED;
            peers: Peers;
        };
        type MessageConfirmed = Meta & {
            type: Types.MESSAGE_CONFIRMED;
            mid: Mid;
            data: Message.Data;
        };
        type CloseConfirmed = Meta & {
            type: Types.CLOSE_CONFIRMED;
        };
        type All = {
            [Types.OPEN_ACCEPTED]: OpenAccepted;
            [Types.OPEN_CONFIRMED]: OpenConfirmed;
            [Types.MESSAGE_CONFIRMED]: MessageConfirmed;
            [Types.CLOSE_CONFIRMED]: CloseConfirmed;
        };
        type Events = SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenConfirm | SparksChannel.Event.MessageConfirm | SparksChannel.Event.CloseConfirm;
        type Any = OpenAccepted | OpenConfirmed | MessageConfirmed | CloseConfirmed;
    }
    namespace Event {
        type Promise = {
            resolve: (args?: any) => any;
            reject: (args?: any) => any;
        };
        enum Types {
            OPEN_REQUEST = "OPEN_REQUEST",
            OPEN_ACCEPT = "OPEN_ACCEPT",
            OPEN_CONFIRM = "OPEN_CONFIRM",
            MESSAGE = "MESSAGE",
            MESSAGE_CONFIRM = "MESSAGE_CONFIRM",
            CLOSE = "CLOSE",
            CLOSE_CONFIRM = "CLOSE_CONFIRM"
        }
        type Meta = {
            eid: Eid;
            cid: Cid;
            timestamp: Timestamp;
        };
        type OpenRequest = Meta & {
            type: Types.OPEN_REQUEST;
            identifier: Identifier;
            publicKeys: PublicKeys;
        };
        type OpenAccept = Meta & {
            type: Types.OPEN_ACCEPT;
            identifier: Identifier;
            publicKeys: PublicKeys;
            receipt: Receipt.Cipher;
        };
        type OpenConfirm = Meta & {
            type: Types.OPEN_CONFIRM;
            identifier: Identifier;
            publicKeys: PublicKeys;
            receipt: Receipt.Cipher;
        };
        type Message = Meta & {
            mid: Mid;
            type: Types.MESSAGE;
            ciphertext: Message.Cipher;
        };
        type MessageConfirm = Meta & {
            mid: Mid;
            type: Types.MESSAGE_CONFIRM;
            receipt: Receipt.Cipher;
        };
        type Close = Meta & {
            type: Types.CLOSE;
        };
        type CloseConfirm = Meta & {
            type: Types.CLOSE_CONFIRM;
            receipt: Receipt.Cipher;
        };
        type All = {
            [Types.OPEN_REQUEST]: OpenRequest;
            [Types.OPEN_ACCEPT]: OpenAccept;
            [Types.OPEN_CONFIRM]: OpenConfirm;
            [Types.MESSAGE]: Message;
            [Types.MESSAGE_CONFIRM]: MessageConfirm;
            [Types.CLOSE]: Close;
            [Types.CLOSE_CONFIRM]: CloseConfirm;
        };
        type Any = OpenRequest | OpenAccept | OpenConfirm | Message | MessageConfirm | Close | CloseConfirm;
    }
    namespace Message {
        type Data = string | Record<string, any>;
        type Cipher = string;
        type Handler = ({ event, data }: {
            event: SparksChannel.Event.Message | SparksChannel.Event.MessageConfirm;
            data: Data;
        }) => void;
    }
    namespace Error {
        type Message = string;
        type Handler = ({ error, }: {
            error: SparksChannel.Error.Any;
        }) => void;
        enum Types {
            SEND_REQUEST_ERROR = "SEND_REQUEST_ERROR",
            EVENT_PROMISE_ERROR = "EVENT_PROMISE_ERROR",
            SHARED_KEY_CREATION_ERROR = "SHARED_KEY_CREATION_ERROR",
            OPEN_REQUEST_REJECTED = "OPEN_REQUEST_REJECTED",
            COMPUTE_SHARED_KEY_ERROR = "COMPUTE_SHARED_KEY_ERROR",
            UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
            INVALID_PUBLIC_KEYS = "INVALID_PUBLIC_KEYS",
            INVALID_IDENTIFIER = "INVALID_IDENTIFIER",
            OPEN_CIPHERTEXT_ERROR = "OPEN_CIPHERTEXT_ERROR",
            CREATE_CIPHERTEXT_ERROR = "CREATE_CIPHERTEXT_ERROR"
        }
        type Meta = {
            cid: Cid;
            eid: Eid;
            timestamp: Timestamp;
            message: Message;
        };
        type SendRequest = Meta & {
            type: Types.SEND_REQUEST_ERROR;
        };
        type EventPromise = Meta & {
            type: Types.EVENT_PROMISE_ERROR;
        };
        type SharedKeyCreation = Meta & {
            type: Types.SHARED_KEY_CREATION_ERROR;
        };
        type OpenRequestRejected = Meta & {
            type: Types.OPEN_REQUEST_REJECTED;
        };
        type ComputeSharedKey = Meta & {
            type: Types.COMPUTE_SHARED_KEY_ERROR;
        };
        type InvalidPublicKeys = Meta & {
            type: Types.INVALID_PUBLIC_KEYS;
        };
        type InvalidIdentifier = Meta & {
            type: Types.INVALID_IDENTIFIER;
        };
        type OpenCiphertext = Meta & {
            type: Types.OPEN_CIPHERTEXT_ERROR;
        };
        type CreateCiphertext = Meta & {
            type: Types.CREATE_CIPHERTEXT_ERROR;
        };
        type Unexpected = Meta & {
            type: Types.UNEXPECTED_ERROR;
        };
        type All = {
            [Types.SEND_REQUEST_ERROR]: SendRequest;
            [Types.EVENT_PROMISE_ERROR]: EventPromise;
            [Types.SHARED_KEY_CREATION_ERROR]: SharedKeyCreation;
            [Types.OPEN_REQUEST_REJECTED]: OpenRequestRejected;
            [Types.COMPUTE_SHARED_KEY_ERROR]: ComputeSharedKey;
            [Types.INVALID_PUBLIC_KEYS]: InvalidPublicKeys;
            [Types.INVALID_IDENTIFIER]: InvalidIdentifier;
            [Types.OPEN_CIPHERTEXT_ERROR]: OpenCiphertext;
            [Types.CREATE_CIPHERTEXT_ERROR]: CreateCiphertext;
            [Types.UNEXPECTED_ERROR]: Unexpected;
        };
        type Any = SendRequest | EventPromise | SharedKeyCreation | OpenRequestRejected | Unexpected | ComputeSharedKey | InvalidPublicKeys | InvalidIdentifier | OpenCiphertext | CreateCiphertext;
    }
    namespace Close {
        type Handler = ({ event, }: {
            event: SparksChannel.Event.Close | SparksChannel.Event.CloseConfirm;
        }) => void;
    }
    namespace Open {
        type Handler = ({ event, }: {
            event: SparksChannel.Event.OpenRequest | SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenConfirm;
        }) => void;
    }
    type RequestHandler = (event: Event.Any | Error.Any) => Promise<void> | never;
}
export declare abstract class AChannel {
    protected spark: ISpark<any, any, any, any, any>;
    protected channel: Channel;
    onmessage: SparksChannel.Message.Handler;
    onerror: SparksChannel.Error.Handler;
    onclose: SparksChannel.Close.Handler;
    onopen: SparksChannel.Open.Handler;
    constructor({ spark, channel }: {
        spark: ISpark<any, any, any, any, any>;
        channel?: Channel;
    });
    get cid(): SparksChannel.Cid;
    get peer(): SparksChannel.Peer;
    get eventLog(): SparksChannel.EventLog;
    get opened(): boolean;
    get sharedKey(): SparksChannel.SharedKey;
    open(): Promise<unknown>;
    close(): Promise<unknown>;
    send(message: any): Promise<unknown>;
    protected acceptOpen(request: any): Promise<unknown>;
    protected rejectOpen(request: any): Promise<void>;
    protected abstract handleResponse(response?: any): any | never;
    protected abstract handleRequest(request: SparksChannel.Event.Any): Promise<void | never>;
}
