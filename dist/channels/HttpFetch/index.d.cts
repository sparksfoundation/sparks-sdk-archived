import { S as SparkChannelParams, C as ChannelPeer, a as SparkChannel, b as SparkChannelInterface, c as SparkChannelActions, d as SparkEvent } from '../../index-66e3d0ba.js';
import 'eventemitter3';
import '../../index-bc7739d8.js';
import '../../types-064649ae.js';
import '../../types-188a9fde.js';
import '../../types-d4be7460.js';
import '../../types-93f6b970.js';

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
