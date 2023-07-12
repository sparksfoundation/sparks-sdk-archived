import { CoreChannel } from "../CoreChannel";
import { CoreChannelParams, ChannelPeer } from "../types";
export type HttpFetchPeer = ChannelPeer & {
    url: Window['location']['href'];
    origin: Window['origin'];
};
export declare class HttpFetch extends CoreChannel {
    constructor({ peer, ...params }: CoreChannelParams & {
        peer: HttpFetchPeer;
    });
    open(): Promise<import("../ChannelEvent").ChannelConfirmEvent<boolean>>;
    message(message: any): Promise<import("../ChannelEvent").ChannelConfirmEvent<boolean>>;
    protected sendRequest(request: any): Promise<void>;
    static receive(): void;
}
