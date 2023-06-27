import { Identifier } from "../controller/types";
import { PublicKeys } from "../types";
import { SparkError } from "../error/SparkError";
import {
  ChannelCloseConfirmationEvent, ChannelMessageConfirmationEvent, ChannelMessageEvent, ChannelOpenAcceptanceEvent,
  ChannelOpenConfirmationEvent, ChannelOpenRejectionEvent, ChannelOpenRequestEvent
} from "./ChannelEvent"


// globals
export type ChannelId = string;
export type ChannelEventId = string;
export type ChannelNextId = string;
export type ChannelMessageId = string;
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

export type OnOpenRequested = (callback: ({
  event,
  acceptOpen,
  rejectOpen,
}: {
  event: ChannelOpenRequestEvent,
  acceptOpen: () => void | SparkError,
  rejectOpen: () => SparkError,
}) => void) => void;

export type OnOpenAccepted = (callback: ({
  event,
  confirmOpen,
  rejectOpen,
}: {
  event: ChannelOpenAcceptanceEvent,
  confirmOpen: () => void | SparkError,
  rejectOpen: () => SparkError,
}) => void) => void;
