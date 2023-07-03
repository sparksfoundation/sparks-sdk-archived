import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { ChannelEventLog, ChannelId, ChannelPeer, ChannelType } from "../types";
export declare class FetchAPI extends CoreChannel {
    private _url;
    private _origin;
    constructor({ spark, url, cid, eventLog, peer }: {
        spark: Spark<any, any, any, any, any>;
        url: string;
        cid?: ChannelId;
        origin?: string;
        eventLog?: ChannelEventLog;
        peer?: ChannelPeer;
    });
    static type: ChannelType;
    get url(): string;
    get origin(): string;
    protected sendRequest(request: any): Promise<void>;
    static receive(): void;
    export(): Promise<Record<string, any>>;
    import(data: any): Promise<void>;
}
