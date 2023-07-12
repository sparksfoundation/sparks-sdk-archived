import { Spark } from "../../Spark";
import { EncryptionSharedKey } from "../../ciphers/types";
import { ChannelId } from "../types";

export type ChannelEventId = string;
export type ChannelNextEventId = string;
export type ChannelEventTimestamp = number;
export type ChannelEventData = Record<string, any>;
export type ChannelEventSealedData = string;

export type ChannelEventMetadata = Record<string, any> & {
  readonly eventId: ChannelEventId;
  readonly channelId: ChannelId;
  readonly nextEventId: ChannelNextEventId;
  [key: string]: any;
};

export type ChannelEventRequestType = 'REQUEST' | `${string}_REQUEST`;
export type ChannelEventConfirmType = 'CONFIRM' | `${string}_CONFIRM`;

export type ChannelEventType = ChannelEventRequestType | ChannelEventConfirmType;

export interface ChannelEventInterface<Type extends ChannelEventType, Sealed extends boolean> {
  readonly type: Type;
  readonly timestamp: ChannelEventTimestamp;
  readonly metadata: ChannelEventMetadata;
  readonly data: Sealed extends true ? ChannelEventSealedData : ChannelEventData;
  readonly sealed: boolean;
}
