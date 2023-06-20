import { Spark } from '../../Spark';
import { Channel } from '../Channel/Channel';
import { ChannelActions, ChannelError } from '../Channel/types';
import Peer, { DataConnection } from "peerjs";
export declare class WebRTC extends Channel {
    protected static peerjs: Peer;
    protected peerId: string;
    protected connection: DataConnection;
    constructor({ spark, peerId, connection, oncall, ...args }: {
        spark: Spark;
        peerId: string;
        oncall?: (args: any) => void;
        connection?: DataConnection;
        args?: any;
    });
    open(payload?: any, action?: ChannelActions): Promise<Channel | ChannelError>;
    call(): Promise<unknown>;
    protected receiveMessage(payload: any): void;
    protected sendMessage(payload: any): void;
    static receive(callback: any, { spark, oncall }: {
        spark: any;
        oncall: any;
    }): void;
}
