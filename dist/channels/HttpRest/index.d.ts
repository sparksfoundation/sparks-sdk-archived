import { S as SparkChannelParams, C as ChannelPeer, a as SparkChannel, b as SparkChannelInterface, c as SparkChannelActions, e as ChannelReceive } from '../../index-a15b0d2c.js';
import 'eventemitter3';
import '../../index-09aeb339.js';
import '../../types-ea65808d.js';
import '../../types-188a9fde.js';
import '../../types-d4be7460.js';
import '../../types-93f6b970.js';

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
