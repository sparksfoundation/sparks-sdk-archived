import { S as SparkChannelParams, C as ChannelPeer, a as SparkChannel, b as SparkChannelInterface, c as SparkChannelActions, e as ChannelReceive } from '../../index-e16de22b.js';
import 'eventemitter3';
import '../../index-cf660960.js';
import '../../types-d473a34c.js';
import '../../types-188a9fde.js';
import '../../types-c76b4006.js';
import '../../types-40269ceb.js';
import '../../types-14ae8009.js';

type HttpRestParams = SparkChannelParams & {
    peer: ChannelPeer & {
        url: Window['location']['href'];
    };
};

declare class HttpRest extends SparkChannel implements SparkChannelInterface<SparkChannelActions> {
    constructor({ peer, ...params }: HttpRestParams);
    sendEvent(payload: any): Promise<void>;
    static requestHandler: (event: any) => Promise<any>;
    static channels: Map<string, HttpRest>;
    static receive: ChannelReceive;
}

export { HttpRest };
