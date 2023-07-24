import { S as SparkChannelParams, C as ChannelPeer, a as SparkChannel, b as SparkChannelInterface, c as SparkChannelActions, d as SparkEvent } from '../../index-e16de22b.js';
import 'eventemitter3';
import '../../index-cf660960.js';
import '../../types-d473a34c.js';
import '../../types-188a9fde.js';
import '../../types-c76b4006.js';
import '../../types-40269ceb.js';
import '../../types-14ae8009.js';

type HttpFetchParams = SparkChannelParams & {
    peer: ChannelPeer & {
        url: Window['location']['href'];
    };
};

declare class HttpFetch extends SparkChannel implements SparkChannelInterface<SparkChannelActions> {
    constructor({ peer, ...params }: HttpFetchParams);
    sendEvent(payload: SparkEvent): Promise<void>;
    static receive(): void;
}

export { HttpFetch };
