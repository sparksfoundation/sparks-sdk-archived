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

export type ChannelEventRequestType<A extends string> = `${A}_REQUEST`;
export type ChannelEventConfirmType<A extends string> = `${A}_CONFIRM`;
export type ChannelEventType<A extends string> = ChannelEventRequestType<A> | ChannelEventConfirmType<A>;

export interface ChannelEventInterface {
  readonly type: ChannelEventConfirmType<any> | ChannelEventRequestType<any>;
  readonly timestamp: ChannelEventTimestamp;
  readonly metadata: ChannelEventMetadata;
  readonly data: ChannelEventData;
  readonly seal: ChannelEventSealedData;
}

export type ChannelEventParams = {
  type: ChannelEventInterface['type'];
  data?: ChannelEventInterface['data'];
  seal?: ChannelEventInterface['seal'];
  metadata: Omit<ChannelEventInterface['metadata'], 'eventId' | 'nextEventId'> & {
    eventId?: ChannelEventId;
    nextEventId?: ChannelNextEventId;
  };
};
