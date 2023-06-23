import { ISpark } from "../../Spark";
import { Identifier, PublicKeys } from "../../controllers";
import { Channel } from "./Channel";
export declare namespace SparksChannel {
    type Cid = string;
    type Eid = string;
    type Mid = string;
    type Timestamp = number;
    type EventMessage = string;
    type ErrorMessage = string;
    type Receipt = string;
    type Peer = {
        identifier: Identifier;
        publicKeys: PublicKeys;
    };
    type Peers = [Peer, Peer];
    enum EventTypes {
        OPEN_REQUEST = "OPEN_REQUEST",
        OPEN_ACCEPT = "OPEN_ACCEPT",
        OPEN_CONFIRM = "OPEN_CONFIRM"
    }
    type ChannelEventMeta = {
        eid: Eid;
        cid: Cid;
        timestamp: Timestamp;
    };
    type OpenRequestEvent = ChannelEventMeta & {
        eid: Eid;
        cid: Cid;
        timestamp: Timestamp;
        type: EventTypes.OPEN_REQUEST;
        identifier: Identifier;
        publicKeys: PublicKeys;
    };
    type OpenAcceptEvent = ChannelEventMeta & {
        eid: Eid;
        cid: Cid;
        timestamp: Timestamp;
        type: EventTypes.OPEN_ACCEPT;
        identifier: Identifier;
        publicKeys: PublicKeys;
        receipt: Receipt;
    };
    type OpenConfirmEvent = ChannelEventMeta & {
        eid: Eid;
        cid: Cid;
        timestamp: Timestamp;
        type: EventTypes.OPEN_CONFIRM;
        receipt: Receipt;
        identifier: Identifier;
        publicKeys: PublicKeys;
    };
    type ChannelEvents = OpenRequestEvent | OpenAcceptEvent | OpenConfirmEvent;
    enum ErrorTypes {
        OPEN_REQUEST_FAILED = "OPEN_REQUEST_FAILED",
        OPEN_REQUEST_REJECTED = "OPEN_REQUEST_REJECTED",
        OPEN_CONFIRM_FAILED = "OPEN_CONFIRM_FAILED",
        RECEIPT_CREATION_FAILED = "RECEIPT_CREATION_FAILED",
        RECEIPT_VERIFICATION_FAILED = "RECEIPT_VERIFICATION_FAILED",
        OPEN_ACCEPT_FAILED = "OPEN_ACCEPT_FAILED",
        OPEN_ACCEPT_REJECTED = "OPEN_ACCEPT_REJECTED",
        CHANNEL_ERROR = "CHANNEL_ERROR"
    }
    type Error = {
        type: ErrorTypes;
        cid: Cid;
        eid: Eid;
        timestamp: Timestamp;
        message: ErrorMessage;
    };
    type Errors = {
        OPEN_REQUEST_REJECTED: Error & {
            type: ErrorTypes.OPEN_REQUEST_REJECTED;
        };
        OPEN_REQUEST_FAILED: Error & {
            type: ErrorTypes.OPEN_REQUEST_FAILED;
        };
        OPEN_CONFIRM_FAILED: Error & {
            type: ErrorTypes.OPEN_CONFIRM_FAILED;
        };
        RECEIPT_CREATION_FAILED: Error & {
            type: ErrorTypes.RECEIPT_CREATION_FAILED;
        };
        RECEIPT_VERIFICATION_FAILED: Error & {
            type: ErrorTypes.RECEIPT_VERIFICATION_FAILED;
        };
        OPEN_ACCEPT_FAILED: Error & {
            type: ErrorTypes.OPEN_ACCEPT_FAILED;
        };
        OPEN_ACCEPT_REJECTED: Error & {
            type: ErrorTypes.OPEN_ACCEPT_REJECTED;
        };
        CHANNEL_ERROR: Error & {
            type: ErrorTypes.CHANNEL_ERROR;
        };
    };
    enum ReceiptTypes {
        OPEN_CONFIRMED = "OPEN_CONFIRMED"
    }
    type ReceiptMeta = {
        cid: Cid;
        timestamp: Timestamp;
    };
    type Receipts = {
        OPEN_CONFIRMED: ReceiptMeta & {
            type: ReceiptTypes.OPEN_CONFIRMED;
            peers: Peers;
        };
    };
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
