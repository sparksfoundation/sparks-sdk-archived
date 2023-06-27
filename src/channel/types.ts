import { Identifier } from "../controller/types";
import { PublicKeys } from "../types";
import { SparkError } from "../error/SparkError";
import { ChannelCore } from "./ChannelCore";

// globals
export type ChannelId = string;
export type ChannelEventId = string;
export type ChannelNextId = string;
export type ChannelMessageId = string;
export type ChannelEventTimestamp = number;                        // utc epoch time in ms
export type ChannelEventMetadata = Record<string, any>;            // additional metadata about the event
export type ChannelEventPayload = string | Record<string, any>;    // data associated with the event
export type ChannelPeer = {
  identifier: Identifier;
  publicKeys: PublicKeys;
}

export enum ChannelState {
  PENDING = 'PENDING',
  OPENED = 'OPENED',
  CLOSED = 'CLOSED',
}

export enum ChannelType {
  CHANNEL_CORE = 'CHANNEL_CORE',
  POSTMESSAGE = 'POSTMESSAGE',
  WEBSOCKET = 'WEBSOCKET',
  WEBRTC = 'WEBRTC',
  RESTFUL = 'RESTFUL',
}


export type ResolveOpenPromise = (
  params: ChannelOpenAcceptanceEvent | ChannelOpenConfirmationEvent | ChannelOpenRejectionEvent | SparkError
) => ChannelOpenAcceptanceEvent | ChannelOpenConfirmationEvent | ChannelOpenRejectionEvent | SparkError

export type ResolveClosePromise = (
  params: ChannelCloseConfirmationEvent | SparkError
) => ChannelCloseConfirmationEvent | SparkError

export type ResolveMessagePromise = (
  params: ChannelMessageConfirmationEvent | SparkError
) => ChannelMessageEvent | SparkError

export type RejectPromise = (
  params: ChannelOpenRejectionEvent | SparkError
) => ChannelOpenRejectionEvent | SparkError

// events
export enum ChannelEventType {
  OPEN_REQUEST = 'OPEN_REQUEST',
  OPEN_ACCEPTANCE = 'OPEN_ACCEPTANCE',
  OPEN_CONFIRMATION = 'OPEN_CONFIRMATION',
  OPEN_REJECTION = 'OPEN_REJECTION',
  CLOSE = 'CLOSE',
  CLOSE_CONFIRMATION = 'CLOSE_CONFIRMATION',
  MESSAGE = 'MESSAGE',
  MESSAGE_CONFIRMATION = 'MESSAGE_CONFIRMATION',
  CHANNEL_ERROR = 'CHANNEL_ERROR',
}

export interface ChannelOpenRequestEvent {
  type: ChannelEventType.OPEN_REQUEST;
  timestamp: ChannelEventTimestamp;
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

export interface ChannelOpenAcceptanceEvent {
  type: ChannelEventType.OPEN_ACCEPTANCE;
  timestamp: ChannelEventTimestamp;
  payload: {
    identifier: Identifier;
    publicKeys: PublicKeys;
    receipt: ChannelEventDigest;
  };
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
  };
}

export interface ChannelOpenConfirmationEvent {
  type: ChannelEventType.OPEN_CONFIRMATION;
  timestamp: ChannelEventTimestamp;
  payload: {
    receipt: ChannelEventDigest
  };
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
  };
}

export interface ChannelOpenRejectionEvent {
  type: ChannelEventType.OPEN_REJECTION;
  timestamp: ChannelEventTimestamp;
  payload: {};
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
  };
}

export interface ChannelCloseEvent {
  type: ChannelEventType.CLOSE;
  timestamp: ChannelEventTimestamp;
  payload: {};
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
  };
}

export interface ChannelCloseConfirmationEvent {
  type: ChannelEventType.CLOSE_CONFIRMATION;
  timestamp: ChannelEventTimestamp;
  payload: {
    receipt: ChannelEventDigest
  };
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
  };
}

export interface ChannelMessageEvent {
  type: ChannelEventType.MESSAGE;
  timestamp: ChannelEventTimestamp;
  payload: ChannelEventPayload;
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
    mid: ChannelMessageId;
  };
}

export interface ChannelMessageConfirmationEvent {
  type: ChannelEventType.MESSAGE_CONFIRMATION;
  timestamp: ChannelEventTimestamp;
  payload: {
    receipt: ChannelEventDigest
  };
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
    mid: ChannelMessageId;
  };
}

export interface ChannelErrorEvent {
  type: ChannelEventType.CHANNEL_ERROR;
  timestamp: ChannelEventTimestamp;
  payload: SparkError;
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
  };
}

export type AnyChannelEvent =
  | ChannelOpenRequestEvent
  | ChannelOpenAcceptanceEvent
  | ChannelOpenConfirmationEvent
  | ChannelOpenRejectionEvent
  | ChannelCloseEvent
  | ChannelCloseConfirmationEvent
  | ChannelMessageEvent
  | ChannelMessageConfirmationEvent
  | ChannelErrorEvent;

export type ChannelEventLog = AnyChannelEvent[];

// receipts
export type ChannelReceiptDigest = string;
export type ChannelEventDigest = string;

export enum ChannelReceiptType {
  OPEN_ACCEPTED = 'OPEN_ACCEPTED',
  OPEN_CONFIRMED = 'OPEN_CONFIRMED',
  CLOSE_CONFIRMED = 'CLOSE_CONFIRMED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
}

export interface ChannelOpenAcceptanceReceipt {
  type: ChannelReceiptType.OPEN_ACCEPTED;
  peers: [ChannelPeer, ChannelPeer];
  eventDigest: ChannelEventDigest;
}

export interface ChannelOpenConfirmationReceipt {
  type: ChannelReceiptType.OPEN_CONFIRMED;
  peers: [ChannelPeer, ChannelPeer];
  eventDigest: ChannelEventDigest;
}

export interface ChannelCloseConfirmationReceipt {
  type: ChannelReceiptType.CLOSE_CONFIRMED;
  eventDigest: ChannelEventDigest;
}

export interface ChannelMessageReceivedReceipt {
  type: ChannelReceiptType.MESSAGE_RECEIVED;
  eventDigest: ChannelEventDigest;
}

export type AnyChannelReceipt =
  | ChannelOpenAcceptanceReceipt
  | ChannelOpenConfirmationReceipt
  | ChannelCloseConfirmationReceipt
  | ChannelMessageReceivedReceipt;