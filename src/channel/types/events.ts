import { ChannelEventId, ChannelId } from ".";
import { EventTimestamp, SparkEvent } from "../../common/events";
import { Identifier } from "../../controller/types";
import { PublicKeys } from "../../types";
import { ChannelEventDigest } from "./receipts";

export enum ChannelEventType {
    OPEN_REQUEST = 'OPEN_REQUEST',
    OPEN_ACCEPTANCE = 'OPEN_ACCEPTANCE',
    OPEN_CONFIRMATION = 'OPEN_CONFIRMATION',
    OPEN_REJECTION = 'OPEN_REJECTION',

    CLOSE = 'CLOSE',
    CLOSE_CONFIRMATION = 'CLOSE_CONFIRMATION',

    MESSAGE = 'MESSAGE',
    MESSAGE_CONFIRMATION = 'MESSAGE_CONFIRMATION',
}

export interface ChannelOpenRequestEvent extends SparkEvent {
    type: ChannelEventType.OPEN_REQUEST;
    timestamp: EventTimestamp;
    payload: {
        identifier: Identifier;
        publicKeys: PublicKeys;
    };
    metadata: {
        eid: ChannelEventId;
        cid: ChannelId;
        neid: ChannelEventId;
    };
}

export interface ChannelOpenAcceptanceEvent extends SparkEvent {
    type: ChannelEventType.OPEN_ACCEPTANCE;
    timestamp: EventTimestamp;
    payload: {
        identifier: Identifier;
        publicKeys: PublicKeys;
        receipt: ChannelEventDigest // digest of => ChannelOpenAcceptanceReceipt;
    };
    metadata: {
        eid: ChannelEventId;
        cid: ChannelId;
        neid: ChannelEventId;
    };
}

export interface ChannelOpenConfirmationEvent extends SparkEvent {
    type: ChannelEventType.OPEN_CONFIRMATION;
    timestamp: EventTimestamp;
    payload: {
        receipt: ChannelEventDigest // digest of => ChannelOpenConfirmationReceipt;
    };
    metadata: {
        eid: ChannelEventId;
        cid: ChannelId;
        neid: ChannelEventId;
    };
}

export interface ChannelOpenRejectionEvent extends SparkEvent {
    type: ChannelEventType.OPEN_REJECTION;
    timestamp: EventTimestamp;
    metadata: {
        eid: ChannelEventId;
        cid: ChannelId;
        neid: ChannelEventId;
    };
}

export interface ChannelCloseEvent extends SparkEvent {
    type: ChannelEventType.CLOSE;
    timestamp: EventTimestamp;
    metadata: {
        eid: ChannelEventId;
        cid: ChannelId;
        neid: ChannelEventId;
    };
}

export interface ChannelCloseConfirmationEvent extends SparkEvent {
    type: ChannelEventType.CLOSE_CONFIRMATION;
    timestamp: EventTimestamp;
    payload: {
        receipt: ChannelEventDigest // digest of => ChannelCloseConfirmationReceipt;
    };
    metadata: {
        eid: ChannelEventId;
        cid: ChannelId;
        neid: ChannelEventId;
    };
}

export interface ChannelMessageEvent extends SparkEvent {
    type: ChannelEventType.MESSAGE;
    timestamp: EventTimestamp;
    payload: {
        message: string;
    };
    metadata: {
        eid: ChannelEventId;
        cid: ChannelId;
        neid: ChannelEventId;
    };
}

export interface ChannelMessageConfirmationEvent extends SparkEvent {
    type: ChannelEventType.MESSAGE_CONFIRMATION;
    timestamp: EventTimestamp;
    payload: {
        receipt: ChannelEventDigest // digest of => ChannelMessageReceivedReceipt;
    };
    metadata: {
        eid: ChannelEventId;
        cid: ChannelId;
        neid: ChannelEventId;
    };
}

export type ChannelEvent = ChannelOpenRequestEvent | ChannelOpenAcceptanceEvent | ChannelOpenConfirmationEvent | ChannelOpenRejectionEvent | ChannelCloseEvent | ChannelCloseConfirmationEvent | ChannelMessageEvent | ChannelMessageConfirmationEvent;
export type ChannelEventLog = ChannelEvent[];

export type ChannelReceiptEvents = ChannelOpenAcceptanceEvent | ChannelOpenConfirmationEvent | ChannelCloseConfirmationEvent | ChannelMessageConfirmationEvent;