import { ISpark } from '../../Spark';
import { AChannel, Channel } from '../Channel';
import Peer, { DataConnection } from "peerjs";
import { Identifier } from '../../controllers';
export declare class WebRTC extends AChannel {
    protected static peerjs: Peer;
    protected connection: DataConnection;
    protected address: string;
    protected peerAddress: string;
    constructor({ spark, connection, channel, address, }: {
        spark: ISpark<any, any, any, any, any>;
        connection?: DataConnection;
        address: string;
        channel?: Channel;
    });
    get peer(): {
        address: string;
        identifier: string;
        publicKeys: import("../../controllers").PublicKeys;
    };
    protected handleResponse(response: any): Promise<unknown>;
    protected handleRequest(request: any): Promise<void>;
    protected static idFromIdentifier(identifier: Identifier): any;
    protected static receive(callback: ({ details, resolve, reject }: {
        details: any;
        resolve: any;
        reject: any;
    }) => void, { spark, }: {
        spark: ISpark<any, any, any, any, any>;
    }): void;
}
