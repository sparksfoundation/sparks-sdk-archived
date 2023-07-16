import { CoreChannel } from "../../CoreChannel";
import { CoreChannelActions, CoreChannelInterface } from "../../types";
import { HttpFetchParams } from "./types";
export declare class HttpFetch extends CoreChannel implements CoreChannelInterface<CoreChannelActions> {
    constructor({ peer, ...params }: HttpFetchParams);
    sendEvent(request: any): Promise<void>;
    static receive(): void;
}
