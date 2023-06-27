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
export type ChannelMessageDataDigest = string;             // encrypted data associated with the event
export type ChannelMessageData = string | Record<string, any>;  // data associated with the event
export type ChannelEventData = string | Record<string, any>;    // data associated with the event
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
  params: ChannelOpenRejectionEvent | ChannelCore | SparkError
) => ChannelOpenRejectionEvent | ChannelCore | SparkError

export type ResolveClosePromise = (
  params: ChannelCloseConfirmationEvent | SparkError
) => ChannelCloseConfirmationEvent | SparkError

export type ResolveMessagePromise = (
  params: ChannelMessageConfirmationEvent | SparkError
) => ChannelMessageEvent | SparkError

export type RejectPromise = (
  params: ChannelOpenRejectionEvent | SparkError
) => ChannelOpenRejectionEvent | SparkError

export type HandleOpenRequested = ({ 
  event, 
  resolve, 
  reject 
}: { 
  event: ChannelOpenRequestEvent, 
  resolve: () => void, 
  reject: () => void 
}) => void;

export type HandleOpenAccepted = ({
  event,
  resolve,
  reject,
}: {
  event: ChannelOpenAcceptanceEvent,
  resolve: () => void,
  reject: () => void,
}) => void;

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
  data: {
    identifier: Identifier;
    publicKeys: PublicKeys;
  };
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    nid: ChannelEventId;
  };
}

export interface ChannelOpenAcceptanceEvent {
  type: ChannelEventType.OPEN_ACCEPTANCE;
  timestamp: ChannelEventTimestamp;
  data: {
    identifier: Identifier;
    publicKeys: PublicKeys;
    receipt: ChannelEventDigest;
  };
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    nid: ChannelEventId;
  };
}

export interface ChannelOpenConfirmationEvent {
  type: ChannelEventType.OPEN_CONFIRMATION;
  timestamp: ChannelEventTimestamp;
  data: {
    receipt: ChannelEventDigest
  };
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    nid: ChannelEventId;
  };
}

export interface ChannelOpenRejectionEvent {
  type: ChannelEventType.OPEN_REJECTION;
  timestamp: ChannelEventTimestamp;
  data: {};
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    nid: ChannelEventId;
  };
}

export interface ChannelCloseEvent {
  type: ChannelEventType.CLOSE;
  timestamp: ChannelEventTimestamp;
  data: {};
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    nid: ChannelEventId;
  };
}

export interface ChannelCloseConfirmationEvent {
  type: ChannelEventType.CLOSE_CONFIRMATION;
  timestamp: ChannelEventTimestamp;
  data: {
    receipt: ChannelEventDigest
  };
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    nid: ChannelEventId;
  };
}

export interface ChannelMessageEvent {
  type: ChannelEventType.MESSAGE;
  timestamp: ChannelEventTimestamp;
  data: ChannelMessageDataDigest;
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    nid: ChannelEventId;
    mid: ChannelMessageId;
  };
}

export interface ChannelDecryptedMessageEvent {
  type: ChannelEventType.MESSAGE;
  timestamp: ChannelEventTimestamp;
  data: ChannelMessageData;
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    nid: ChannelEventId;
    mid: ChannelMessageId;
  };
}

export interface ChannelMessageConfirmationEvent {
  type: ChannelEventType.MESSAGE_CONFIRMATION;
  timestamp: ChannelEventTimestamp;
  data: {
    receipt: ChannelEventDigest
  };
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    nid: ChannelEventId;
    mid: ChannelMessageId;
  };
}

export interface ChannelErrorEvent {
  type: ChannelEventType.CHANNEL_ERROR;
  timestamp: ChannelEventTimestamp;
  data: SparkError;
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    nid: ChannelEventId;
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
  | ChannelDecryptedMessageEvent
  | ChannelMessageConfirmationEvent
  | ChannelErrorEvent;

export type AnyChannelEventWithSource = AnyChannelEvent & {
  request?: boolean;
  response?: boolean;
};

export type ChannelEventLog = AnyChannelEventWithSource[];

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
  messageDigest: ChannelMessageDataDigest;
  eventDigest: ChannelEventDigest;
}

export type AnyChannelReceipt =
  | ChannelOpenAcceptanceReceipt
  | ChannelOpenConfirmationReceipt
  | ChannelCloseConfirmationReceipt
  | ChannelMessageReceivedReceipt;