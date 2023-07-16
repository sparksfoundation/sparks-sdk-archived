import { CoreChannel } from "../../CoreChannel";
import { ChannelReceive, CoreChannelActions, CoreChannelInterface } from "../../types";
import { HttpRestParams } from "./types";
export declare class HttpRest extends CoreChannel implements CoreChannelInterface<CoreChannelActions> {
    constructor({ peer, ...params }: HttpRestParams);
    static requestHandler: any;
    static channels: Map<string, HttpRest>;
    static receive: ChannelReceive;
}
