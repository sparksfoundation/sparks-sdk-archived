import { CoreChannel } from "../../CoreChannel";
import { CoreChannelParams, ChannelPeer, ChannelSendRequest, ChannelReceive } from "../../types";
import { ChannelEvent } from "../../ChannelEvent";
import { ChannelError } from "../../../errors/channel";
import { ChannelEventType } from "../../ChannelEvent/types";
export type PostMessageParams = CoreChannelParams & {
    _window?: Window;
    source?: Window;
    peer: Partial<ChannelPeer> & {
        origin: Window['origin'];
    };
};
export declare class PostMessage extends CoreChannel {
    private _source;
    private _window?;
    constructor({ _window, source, peer, ...params }: PostMessageParams);
    open(): Promise<import("../../ChannelEvent").ChannelConfirmEvent<boolean>>;
    close(): Promise<import("../../ChannelEvent").ChannelConfirmEvent<boolean>>;
    message(message: any): Promise<import("../../ChannelEvent").ChannelConfirmEvent<boolean>>;
    protected sendRequest: ChannelSendRequest;
    protected handleResponse(event: ChannelEvent<ChannelEventType, boolean> | ChannelError): Promise<void>;
    static receive: ChannelReceive;
}
