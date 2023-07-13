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

        this.channel.on([
            this.channel.eventTypes.OPEN_REQUEST,
            this.channel.eventTypes.CLOSE_CONFIRM,
            this.channel.errorTypes.REQUEST_TIMEOUT_ERROR,
        ], (event) => {
            const closeConfirmed = event.type === 'CLOSE_CONFIRM';
            const closeTimeout = event.type === 'REQUEST_TIMEOUT_ERROR' && event.metadata.eventType === 'CLOSE_REQUEST';
            if (closeConfirmed || closeTimeout) {
                this.status = 'CLOSED';
                this.channel.removeAllListeners();
            }
        });
    }

    public OPEN_REQUEST: ChannelActionRequest = async (params) => {
        const type = Events.OPEN_REQUEST;
        const { eventId, ...meta } = params?.metadata || {}
        const metadata = { ...meta, channelId: this.channel.channelId };
        const data = merge({}, params?.data, {
            peer: {
                identifier: this.channel.identifier,
                publicKeys: this.channel.publicKeys,
            }
        });
        const request = new ChannelRequestEvent({ type, metadata, data });
        const confirmEvent = await this.channel.dispatchRequest(request) as ChannelConfirmEvent;
        await this.channel.setSharedKey(confirmEvent.data.peer.publicKeys.cipher);
        this.channel.peer.publicKeys = confirmEvent.data.peer.publicKeys;
        this.status = 'OPEN';
        return confirmEvent;
    }

    public OPEN_CONFIRM: ChannelActionConfirm = async (requestEvent: ChannelRequestEvent) => {
        await this.channel.setSharedKey(requestEvent.data.peer.publicKeys.cipher);
        this.channel.peer.publicKeys = requestEvent.data.peer.publicKeys;
        this.status = 'OPEN'; 
        const { eventId, ...meta } = requestEvent?.metadata || {}
        return Promise.resolve(new ChannelConfirmEvent({
            type: Events.OPEN_CONFIRM,
            metadata: merge({}, meta),
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
        const { eventId, ...meta } = params?.metadata || {}
        const metadata = { ...meta, channelId: this.channel.channelId }
        const request = new ChannelRequestEvent({ type, metadata, data });
        this.status = 'CLOSED';
        const confirmEvent = await this.channel.dispatchRequest(request) as ChannelConfirmEvent;
        return confirmEvent;
    }

    public CLOSE_CONFIRM: ChannelActionConfirm = async (requestEvent: ChannelRequestEvent) => {
        this.status = 'CLOSED';
        const { eventId, ...meta } = requestEvent?.metadata || {}
        
        return Promise.resolve(new ChannelConfirmEvent({
            type: Events.CLOSE_CONFIRM,
            metadata: merge({}, meta),
            data:  merge({}, requestEvent?.data),
        }));
    }
}