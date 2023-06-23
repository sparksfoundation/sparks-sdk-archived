import { ISpark } from "../../Spark";
import { Identifier, PublicKeys } from "../../controllers";
import { Channel } from "./Channel";
export declare namespace SparksChannel {
    type Cid = string;
    type Eid = string;
    type Mid = string;
    type Timestamp = number;
    type Peer = {
        identifier: Identifier;
        publicKeys: PublicKeys;
    };
    type Peers = [Peer, Peer];
    namespace Receipt {
        type Cipher = string;
        enum Types {
            OPEN_ACCEPTED = "OPEN_ACCEPTED",
            OPEN_CONFIRMED = "OPEN_CONFIRMED",
            MESSAGE_RECEIVED = "MESSAGE_RECEIVED"
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
            type: Types.MESSAGE_RECEIVED;
            mid: Mid;
            payload: Message.Payload;
        };
        type All = {
            [Types.OPEN_ACCEPTED]: OpenAccepted;
            [Types.OPEN_CONFIRMED]: OpenConfirmed;
            [Types.MESSAGE_RECEIVED]: MessageConfirmed;
        };
        type Events = SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenRequest | SparksChannel.Event.MessageConfirm;
        type Any = OpenAccepted | OpenConfirmed | MessageConfirmed;
    }
    namespace Event {
        enum Types {
            OPEN_REQUEST = "OPEN_REQUEST",
            OPEN_ACCEPT = "OPEN_ACCEPT",
            OPEN_CONFIRM = "OPEN_CONFIRM",
            MESSAGE_REQUEST = "MESSAGE_REQUEST",
            MESSAGE_CONFIRM = "MESSAGE_CONFIRM"
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
        type All = {
            [Types.OPEN_REQUEST]: OpenRequest;
            [Types.OPEN_ACCEPT]: OpenAccept;
            [Types.OPEN_CONFIRM]: OpenConfirm;
            [Types.MESSAGE_REQUEST]: MessageRequest;
            [Types.MESSAGE_CONFIRM]: MessageConfirm;
        };
        type Any = OpenRequest | OpenAccept | OpenConfirm | MessageRequest | MessageConfirm;
    }
    namespace Message {
        type Payload = string | Record<string, any>;
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
            UNEXPECTED_ERROR = "UNEXPECTED_ERROR"
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
            [Types.UNEXPECTED_ERROR]: Unexpected;
        };
        type Any = SendRequest | EventPromise | ReceiptCreation | ReceiptVerification | SharedKeyCreation | OpenRequestRejected | Unexpected;
    }
    type RequestHandler = (event: Event.Any | Error.Any) => boolean;
}
export declare abstract class AChannel {
    protected spark: ISpark<any, any, any, any, any>;
    protected channel: Channel;
    constructor(spark: any);
    protected get cid(): SparksChannel.Cid;
    protected get peer(): SparksChannel.Peer;
    protected abstract open(): void;
    protected abstract close(): void;
    protected abstract send(message: string | Record<string, any>): void;
}
