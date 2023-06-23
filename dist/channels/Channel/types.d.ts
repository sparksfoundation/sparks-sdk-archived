import { ISpark } from "../../Spark";
import { SharedEncryptionKey } from "../../ciphers";
import { Identifier, PublicKeys } from "../../controllers";
import { Channel } from "./Channel";
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
            payload: Message.Payload;
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
            MESSAGE_REQUEST = "MESSAGE_REQUEST",
            MESSAGE_CONFIRM = "MESSAGE_CONFIRM",
            CLOSE_REQUEST = "CLOSE_REQUEST",
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
        type MessageRequest = Meta & {
            mid: Mid;
            type: Types.MESSAGE_REQUEST;
            payload: Message.Payload;
        };
        type MessageConfirm = Meta & {
            mid: Mid;
            type: Types.MESSAGE_CONFIRM;
            receipt: Receipt.Cipher;
        };
        type CloseRequest = Meta & {
            type: Types.CLOSE_REQUEST;
        };
        type CloseConfirm = Meta & {
            type: Types.CLOSE_CONFIRM;
            receipt: Receipt.Cipher;
        };
        type All = {
            [Types.OPEN_REQUEST]: OpenRequest;
            [Types.OPEN_ACCEPT]: OpenAccept;
            [Types.OPEN_CONFIRM]: OpenConfirm;
            [Types.MESSAGE_REQUEST]: MessageRequest;
            [Types.MESSAGE_CONFIRM]: MessageConfirm;
            [Types.CLOSE_REQUEST]: CloseRequest;
            [Types.CLOSE_CONFIRM]: CloseConfirm;
        };
        type Any = OpenRequest | OpenAccept | OpenConfirm | MessageRequest | MessageConfirm | CloseRequest | CloseConfirm;
    }
    namespace Message {
        type Payload = string | Record<string, any>;
        type Result = {
            payload: Payload;
            receipt: Receipt.Cipher;
        };
    }
    namespace Error {
        type Message = string;
        enum Types {
            SEND_REQUEST_ERROR = "SEND_REQUEST_ERROR",
            EVENT_PROMISE_ERROR = "EVENT_PROMISE_ERROR",
            RECEIPT_CREATION_ERROR = "RECEIPT_CREATION_ERROR",
            RECEIPT_VERIFICATION_ERROR = "RECEIPT_VERIFICATION_ERROR",
            SHARED_KEY_CREATION_ERROR = "SHARED_KEY_CREATION_ERROR",
            OPEN_REQUEST_REJECTED = "OPEN_REQUEST_REJECTED",
            COMPUTE_SHARED_KEY_ERROR = "COMPUTE_SHARED_KEY_ERROR",
            UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
            INVALID_PUBLIC_KEYS = "INVALID_PUBLIC_KEYS",
            INVALID_IDENTIFIER = "INVALID_IDENTIFIER"
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
        type ReceiptCreation = Meta & {
            type: Types.RECEIPT_CREATION_ERROR;
        };
        type ReceiptVerification = Meta & {
            type: Types.RECEIPT_VERIFICATION_ERROR;
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
        type Unexpected = Meta & {
            type: Types.UNEXPECTED_ERROR;
        };
        type All = {
            [Types.SEND_REQUEST_ERROR]: SendRequest;
            [Types.EVENT_PROMISE_ERROR]: EventPromise;
            [Types.RECEIPT_CREATION_ERROR]: ReceiptCreation;
            [Types.RECEIPT_VERIFICATION_ERROR]: ReceiptVerification;
            [Types.SHARED_KEY_CREATION_ERROR]: SharedKeyCreation;
            [Types.OPEN_REQUEST_REJECTED]: OpenRequestRejected;
            [Types.COMPUTE_SHARED_KEY_ERROR]: ComputeSharedKey;
            [Types.INVALID_PUBLIC_KEYS]: InvalidPublicKeys;
            [Types.INVALID_IDENTIFIER]: InvalidIdentifier;
            [Types.UNEXPECTED_ERROR]: Unexpected;
        };
        type Any = SendRequest | EventPromise | ReceiptCreation | ReceiptVerification | SharedKeyCreation | OpenRequestRejected | Unexpected | ComputeSharedKey | InvalidPublicKeys | InvalidIdentifier;
    }
    type RequestHandler = (event: Event.Any | Error.Any) => Promise<void> | never;
}
export declare abstract class AChannel {
    protected spark: ISpark<any, any, any, any, any>;
    protected channel: Channel;
    constructor(spark: any);
    protected get cid(): SparksChannel.Cid;
    protected get peer(): SparksChannel.Peer;
    protected get eventLog(): SparksChannel.EventLog;
    protected get opened(): boolean;
    protected open(): Promise<unknown>;
    protected close(): Promise<unknown>;
    protected send(message: any): Promise<unknown>;
    protected acceptOpen(request: any): Promise<unknown>;
    protected rejectOpen(request: any): Promise<void>;
    protected abstract sendRequest(request: SparksChannel.Event.Any): Promise<void | never>;
    protected abstract handleResponse(response?: any): any | never;
}
