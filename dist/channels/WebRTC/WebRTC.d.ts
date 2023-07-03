import { Spark } from "../../Spark";
import { Identifier } from "../../controllers/types";
import { CoreChannel } from "../CoreChannel";
import { ChannelCloseConfirmationEvent, ChannelCloseEvent, ChannelEventLog, ChannelId, ChannelOpenRejectionEvent, ChannelPeer, ChannelType, HandleOpenRequested } from "../types";
import Peer, { DataConnection } from "peerjs";
export declare class WebRTC extends CoreChannel {
    protected static peerjs: Peer;
    private _connection;
    private _address;
    private _peerAddress;
    private _peerIdentifier;
    constructor({ spark, connection, cid, peerIdentifier, eventLog, peer, }: {
        spark: Spark<any, any, any, any, any>;
        connection?: DataConnection;
        cid?: ChannelId;
        peerIdentifier: string;
        eventLog?: ChannelEventLog;
        peer?: ChannelPeer;
    });
    static type: ChannelType;
    get address(): string;
    get peerAddress(): string;
    get connection(): DataConnection;
    open(): Promise<import("../../errors/SparkError").SparkError | ChannelOpenRejectionEvent | CoreChannel>;
    protected handleClosed(event: ChannelCloseEvent | ChannelCloseConfirmationEvent): Promise<void>;
    handleResponse(response: any): Promise<void>;
    protected sendRequest(request: any): Promise<void>;
    protected static idFromIdentifier(identifier: Identifier): any;
    static handleOpenRequests(callback: HandleOpenRequested, { spark }: {
        spark: Spark<any, any, any, any, any>;
    }): void;
    export(): Promise<Record<string, any>>;
}
