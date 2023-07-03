import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { AnyChannelEvent, ChannelEventLog, ChannelId, ChannelPeer, ChannelType, HandleOpenRequested } from "../types";
export declare class RestAPI extends CoreChannel {
    private static promises;
    private static receives;
    static requestHandler: Function;
    constructor({ spark, cid, eventLog, peer }: {
        spark: Spark<any, any, any, any, any>;
        cid?: ChannelId;
        eventLog?: ChannelEventLog;
        peer?: ChannelPeer;
    });
    static type: ChannelType;
    protected handleResponse(response: any): Promise<void>;
    protected sendRequest(request: AnyChannelEvent): Promise<void>;
    static handleOpenRequests(callback: HandleOpenRequested, { spark }: {
        spark: Spark<any, any, any, any, any>;
    }): void;
}
