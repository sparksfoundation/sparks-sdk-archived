import { CoreChannel } from "../CoreChannel";
import { CoreChannelParams, ChannelPeer, ChannelReceive } from "../types";
import { ChannelRequestEvent } from "../ChannelEvent";
export type HttpRestPeer = ChannelPeer & {
    origin: Window['origin'];
};
export declare class HttpRest extends CoreChannel {
    private static promises;
    private static receives;
    static requestHandler: Function;
    constructor({ peer, ...params }: CoreChannelParams & {
        peer: HttpRestPeer;
    });
    protected handleResponse(response: any): Promise<void>;
    protected open(event: any): Promise<import("../ChannelEvent").ChannelConfirmEvent<boolean>>;
    protected sendRequest(request: ChannelRequestEvent<any>): Promise<void>;
    static receive: ChannelReceive;
}
