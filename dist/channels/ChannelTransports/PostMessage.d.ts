import { CoreChannel } from "../CoreChannel";
import { CoreChannelParams, ChannelPeer, ChannelSendRequest, ChannelReceive } from "../types";
export type PostMessagePeer = ChannelPeer & {
    origin: Window['origin'];
};
export declare class PostMessage extends CoreChannel {
    private _source;
    private _window?;
    constructor({ _window, source, peer, ...params }: CoreChannelParams & {
        _window?: Window;
        source?: Window;
        peer: PostMessagePeer;
    });
    open(): Promise<import("../ChannelEvent").ChannelConfirmEvent<boolean>>;
    close(): Promise<import("../ChannelEvent").ChannelConfirmEvent<boolean>>;
    message(message: any): Promise<import("../ChannelEvent").ChannelConfirmEvent<boolean>>;
    protected sendRequest: ChannelSendRequest;
    static receive: ChannelReceive;
}
