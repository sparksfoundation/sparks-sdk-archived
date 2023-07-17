import { ChannelEventInterface, ChannelEventRequestType, ChannelEventConfirmType, ChannelEventParams } from "./types";
export declare class ChannelEvent implements ChannelEventInterface {
    readonly type: ChannelEventInterface['type'];
    readonly timestamp: ChannelEventInterface['timestamp'];
    readonly metadata: ChannelEventInterface['metadata'];
    readonly data: ChannelEventInterface['data'];
    readonly seal: ChannelEventInterface['seal'];
    constructor(params: ChannelEventParams);
}
export declare class ChannelRequestEvent extends ChannelEvent {
    readonly type: ChannelEventRequestType<any>;
    constructor(params: ChannelEventParams);
}
export declare class ChannelConfirmEvent extends ChannelEvent {
    readonly type: ChannelEventConfirmType<any>;
    constructor(params: ChannelEventParams);
}
