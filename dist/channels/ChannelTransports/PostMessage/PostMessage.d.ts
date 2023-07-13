import { CoreChannel } from "../../CoreChannel";
import { CoreChannelParams, ChannelPeer, ChannelSendRequest, ChannelReceive } from "../../types";
export type PostMessageParams = CoreChannelParams & {
    _window?: Window;
    source?: Window;
    peer: Partial<ChannelPeer> & {
        origin: Window['origin'];
    };
};
export declare class PostMessage extends CoreChannel {
    readonly type = "PostMessage";
    private _source;
    private _window?;
    constructor({ _window, source, peer, ...params }: PostMessageParams);
    setSource(source: Window): void;
    open(): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    close(): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    message(message: any): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    protected sendRequest: ChannelSendRequest;
    static receive: ChannelReceive;
}
