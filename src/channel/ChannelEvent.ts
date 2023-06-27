import { EncryptionSharedKey } from "../cipher/types";
import { utcEpochTimestamp } from "../common";
import { Identifier } from "../controller/types";
import { PublicKeys } from "../types";
import { ChannelEventDigest } from "./ChannelReceipt";
import { ChannelEventId, ChannelId, ChannelMessageId } from "./types";

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
}

export type EventTimestamp = number;                        // utc epoch time in ms
export type EventId = string;                               // unique id for the event
export type EventMetadata = Record<string, any>;            // additional metadata about the event
export type EventPayload = string | Record<string, any>;    // data associated with the event

export interface ChannelOpenRequestEvent {
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

export interface ChannelOpenAcceptanceEvent {
  type: ChannelEventType.OPEN_ACCEPTANCE;
  timestamp: EventTimestamp;
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
  timestamp: EventTimestamp;
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
  timestamp: EventTimestamp;
  payload: {};
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
  };
}

export interface ChannelCloseEvent {
  type: ChannelEventType.CLOSE;
  timestamp: EventTimestamp;
  payload: {};
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
  };
}

export interface ChannelCloseConfirmationEvent {
  type: ChannelEventType.CLOSE_CONFIRMATION;
  timestamp: EventTimestamp;
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
  timestamp: EventTimestamp;
  payload: {
    message: string
  };
  metadata: {
    eid: ChannelEventId;
    cid: ChannelId;
    neid: ChannelEventId;
    mid: ChannelMessageId;
  };
}

export interface ChannelMessageConfirmationEvent {
  type: ChannelEventType.MESSAGE_CONFIRMATION;
  timestamp: EventTimestamp;
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

export type AnyChannelEvent =
  | ChannelOpenRequestEvent
  | ChannelOpenAcceptanceEvent
  | ChannelOpenConfirmationEvent
  | ChannelOpenRejectionEvent
  | ChannelCloseEvent
  | ChannelCloseConfirmationEvent
  | ChannelMessageEvent
  | ChannelMessageConfirmationEvent;

  export type ChannelEventLog = AnyChannelEvent[];