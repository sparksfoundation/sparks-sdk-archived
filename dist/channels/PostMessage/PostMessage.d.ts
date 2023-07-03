import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { AnyChannelEvent, ChannelEventLog, ChannelId, ChannelPeer, ChannelType, HandleOpenRequested } from "../types";
export declare class PostMessage extends CoreChannel {
    private _source;
    private _origin;
    private _window?;
    constructor({ _window, cid, source, origin, spark, eventLog, peer }: {
        _window?: Window;
        cid?: ChannelId;
        source?: Window;
        origin: Window['origin'];
        spark: Spark<any, any, any, any, any>;
        eventLog?: ChannelEventLog;
        peer?: ChannelPeer;
    });
    static type: ChannelType;
    get origin(): string;
    get source(): Window;
    open(): Promise<import("../../errors/SparkError").SparkError | import("../types").ChannelOpenRejectionEvent | CoreChannel>;
    protected handleClosed(event: any): void;
    protected handleResponse(event: any): Promise<any>;
    protected sendRequest(event: AnyChannelEvent): Promise<void>;
    static handleOpenRequests(callback: HandleOpenRequested, { spark, _window }: {
        spark: Spark<any, any, any, any, any>;
        _window?: Window;
    }): void;
    export(): Promise<Record<string, any>>;
    import(data: any): Promise<void>;
}
