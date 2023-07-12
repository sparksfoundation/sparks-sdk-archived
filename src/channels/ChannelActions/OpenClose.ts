import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent";
import { ChannelActionConfirm, ChannelActionRequest } from "./types";
import { Spark } from "../../Spark";
import merge from 'lodash.merge';
import { CoreChannel } from "../CoreChannel";
import { ChannelAction } from "./ChannelAction";

type Actions = ['OPEN', 'CLOSE'];
const Actions = ['OPEN', 'CLOSE'] as const;

const Events = {
    OPEN_REQUEST: 'OPEN_REQUEST',
    OPEN_CONFIRM: 'OPEN_CONFIRM',
    OPEN_ERROR: 'OPEN_ERROR',
    CLOSE_REQUEST: 'CLOSE_REQUEST',
    CLOSE_CONFIRM: 'CLOSE_CONFIRM',
    CLOSE_ERROR: 'CLOSE_ERROR',
} as const;

export class OpenClose extends ChannelAction<Actions>{
    public readonly name = 'OPEN_CLOSE';
    public readonly actions = Actions as Actions;
    public status: 'OPEN' | 'CLOSED' = 'CLOSED';

    public setContext({ spark, channel }: { spark: Spark<any, any, any, any, any>; channel: CoreChannel; }): void {
        this.spark = spark;
        this.channel = channel;
        this.channel.requestPreflight((requestEvent) => {
            const type = requestEvent.type as string;
            const isAllowed = [ 'OPEN_REQUEST', 'CLOSE_REQUEST' ].includes(type);
            const isClosed = this.status === 'CLOSED';
            if (!isAllowed && isClosed) throw new Error('channel is closed');
        });
    }

    public OPEN_REQUEST: ChannelActionRequest = async (params) => {
        const type = Events.OPEN_REQUEST;
        const metadata = { ...params?.metadata, channelId: this.channel.channelId };
        const data = merge({}, params?.data, {
            peer: {
                identifier: this.spark.identifier,
                publicKeys: this.spark.publicKeys,
            }
        });
        const request = new ChannelRequestEvent({ type, metadata, data });
        const confirmEvent = await this.channel.dispatchRequest(request) as ChannelConfirmEvent<false>;
        const sharedKey = await this.spark.cipher.generateSharedKey({ publicKey: confirmEvent.data.peer.publicKeys.cipher });
        this.channel.peer = merge({}, this.channel.peer, { sharedKey }, confirmEvent.data.peer);
        this.status = 'OPEN';
        return confirmEvent;
    }

    public OPEN_CONFIRM: ChannelActionConfirm = async (requestEvent: ChannelRequestEvent<false>) => {
        return Promise.resolve(new ChannelConfirmEvent({
            type: Events.OPEN_CONFIRM,
            metadata: merge({}, requestEvent?.metadata),
            data: merge({}, requestEvent?.data, {
                peer: {
                    identifier: this.spark.identifier,
                    publicKeys: this.spark.publicKeys,
                }
            }),
        }));
    }

    public CLOSE_REQUEST: ChannelActionRequest = async (params) => {
        const type = Events.CLOSE_REQUEST;
        const data = params?.data || {};
        const metadata = { ...params?.metadata, channelId: this.channel.channelId }
        const request = new ChannelRequestEvent({ type, metadata, data });
        this.status = 'CLOSED';
        const confirmEvent = await this.channel.dispatchRequest(request) as ChannelConfirmEvent<false>;
        return confirmEvent;
    }

    public CLOSE_CONFIRM: ChannelActionConfirm = async (requestEvent: ChannelRequestEvent<false>) => {
        this.status = 'CLOSED';
        return Promise.resolve(new ChannelConfirmEvent<false>({
            type: Events.CLOSE_CONFIRM,
            metadata: { ...requestEvent.metadata, ...requestEvent?.metadata },
            data: { ...requestEvent.data, ...requestEvent?.data },
        }));
    }
}