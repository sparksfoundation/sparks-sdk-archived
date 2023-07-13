import { CoreChannel } from "../../CoreChannel";
import { CoreChannelParams, ChannelPeer } from "../../types";
export type HttpFetchPeer = ChannelPeer & {
    url: Window['location']['href'];
    origin: Window['origin'];
};
export type HttpFetchParams = CoreChannelParams & {
    peer: HttpFetchPeer;
};
export declare class HttpFetch extends CoreChannel {
    readonly type = "HttpFetch";
    constructor({ peer, ...params }: HttpFetchParams);
    open(): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    message(message: any): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    protected sendRequest(request: any): Promise<void>;
    static receive(): void;
}
