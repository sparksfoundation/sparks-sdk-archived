import { CoreChannel } from "../../CoreChannel";
import { CoreChannelParams, ChannelPeer, ChannelReceive } from "../../types";
import { ChannelRequestEvent } from "../../ChannelEvent";
export type HttpRestPeer = ChannelPeer & {
    origin: Window['origin'];
};
export declare class HttpRest extends CoreChannel {
    readonly type = "HttpRest";
    private static promises;
    private static receives;
    static requestHandler: Function;
    constructor({ peer, ...params }: CoreChannelParams & {
        peer: HttpRestPeer;
    });
    protected sendRequest(request: ChannelRequestEvent): Promise<void>;
    static receive: ChannelReceive;
}
