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
export interface ChannelEventInterface<Type extends ChannelEventType> {
    readonly type: Type;
    readonly timestamp: ChannelEventTimestamp;
    readonly metadata: ChannelEventMetadata;
    readonly data: ChannelEventData;
    readonly seal: ChannelEventSealedData;
}
