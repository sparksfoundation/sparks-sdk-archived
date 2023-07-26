import { S as SparkChannelParams, f as ChannelExport, g as ChannelType, a as SparkChannel, b as SparkChannelInterface, c as SparkChannelActions, R as RequestParams, h as SparkRequestEvent, i as RequestOptions, j as SparkConfirmEvent, d as SparkEvent, e as ChannelReceive } from '../../index-a15b0d2c.js';
import 'eventemitter3';
import '../../index-09aeb339.js';
import '../../types-ea65808d.js';
import '../../types-188a9fde.js';
import '../../types-d4be7460.js';
import '../../types-93f6b970.js';

type PostMessageParams = SparkChannelParams & {
    _window?: Window;
    source?: Window;
};
type PostMessageExport = ChannelExport & {
    type: ChannelType;
    peer: ChannelExport['peer'] & {
        origin: string;
    };
};

declare class PostMessage extends SparkChannel implements SparkChannelInterface<SparkChannelActions> {
    constructor(params: PostMessageParams);
    open(params?: RequestParams): Promise<this>;
    onOpenRequested(request: SparkRequestEvent): Promise<void>;
    confirmOpen(request: SparkRequestEvent): Promise<void>;
    close(params?: RequestParams, options?: RequestOptions): Promise<SparkConfirmEvent>;
    onCloseConfirmed(confirm: SparkConfirmEvent): Promise<void>;
    onCloseRequested(request: SparkRequestEvent): Promise<void>;
    handleEvent(payload: any): Promise<void>;
    sendEvent(event: SparkEvent): Promise<void>;
    export(): PostMessageExport;
    import(data: PostMessageExport): Promise<void>;
    static receive: ChannelReceive;
}

export { PostMessage };
