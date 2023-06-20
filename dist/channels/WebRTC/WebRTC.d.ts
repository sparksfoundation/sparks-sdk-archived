import { Spark } from '../../Spark';
import { Channel } from '../Channel/Channel';
import { ChannelActions, ChannelError } from '../Channel/types';
import Peer, { DataConnection } from "peerjs";
export declare class WebRTC extends Channel {
    protected static peerjs: Peer;
    protected peerId: string;
    protected connection: DataConnection;
    protected _oncall: Function;
    constructor({ spark, peerId, connection, ...args }: {
        spark: Spark;
        peerId: string;
        connection?: DataConnection;
        args?: any;
    });
    open(payload?: any, action?: ChannelActions): Promise<Channel | ChannelError>;
    protected receiveMessage(payload: any): void;
    protected sendMessage(payload: any): void;
    static receive(callback: any, { spark }: {
        spark: any;
    }): void;
}
