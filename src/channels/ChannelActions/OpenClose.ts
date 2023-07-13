import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "../ChannelEvent";
import { ChannelActionConfirm, ChannelActionRequest } from "./types";
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

    public setContext({ channel }: { channel: CoreChannel; }): void {
        this.channel = channel;
        this.channel.requestPreflight((requestEvent) => {
            const type = requestEvent.type as string;
            const isAllowed = [ 'OPEN_REQUEST', 'CLOSE_REQUEST' ].includes(type);
            const isClosed = this.status === 'CLOSED';
            if (!isAllowed && isClosed) throw new Error('channel is closed');
        });
    }

    public OPEN_REQUEST: ChannelActionRequest = async (params) => {
      console.log('requesting')
        const type = Events.OPEN_REQUEST;
        const ids = ChannelEvent._getEventIds();
        const metadata = { ...params?.metadata, channelId: this.channel.channelId, ...ids };
        const data = merge({}, params?.data, {
            peer: {
                identifier: this.channel.identifier,
                publicKeys: this.channel.publicKeys,
            }
        });
        const request = new ChannelRequestEvent({ type, metadata, data });
        const confirmEvent = await this.channel.dispatchRequest(request) as ChannelConfirmEvent<false>;
        await this.channel.setSharedKey(confirmEvent.data.peer.publicKeys.cipher);
        this.channel.peer.publicKeys = confirmEvent.data.peer.publicKeys;
        this.status = 'OPEN';
        return confirmEvent;
    }

    public OPEN_CONFIRM: ChannelActionConfirm = async (requestEvent: ChannelRequestEvent<false>) => {
        await this.channel.setSharedKey(requestEvent.data.peer.publicKeys.cipher);
        this.channel.peer.publicKeys = requestEvent.data.peer.publicKeys;
        this.status = 'OPEN'; 
        const ids = ChannelEvent._getEventIds();
        return Promise.resolve(new ChannelConfirmEvent({
            type: Events.OPEN_CONFIRM,
            metadata: merge({}, requestEvent?.metadata, ids),
            data: merge({}, requestEvent?.data, {
                peer: {
                    identifier: this.channel.identifier,
                    publicKeys: this.channel.publicKeys,
                }
            }),
        }));
    }

    public CLOSE_REQUEST: ChannelActionRequest = async (params) => {
        const type = Events.CLOSE_REQUEST;
        const data = params?.data || {};
        const ids = ChannelEvent._getEventIds();
        const metadata = { ...params?.metadata, channelId: this.channel.channelId, ...ids }
        const request = new ChannelRequestEvent({ type, metadata, data });
        this.status = 'CLOSED';
        const confirmEvent = await this.channel.dispatchRequest(request) as ChannelConfirmEvent<false>;
        return confirmEvent;
    }

    public CLOSE_CONFIRM: ChannelActionConfirm = async (requestEvent: ChannelRequestEvent<false>) => {
        this.status = 'CLOSED';
        const ids = ChannelEvent._getEventIds();
        return Promise.resolve(new ChannelConfirmEvent<false>({
            type: Events.CLOSE_CONFIRM,
            metadata: merge({}, requestEvent?.metadata, ids),
            data:  merge({}, requestEvent?.data),
        }));
    }
}