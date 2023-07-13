import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "../ChannelEvent";
import { ChannelActionConfirm, ChannelActionInterface, ChannelActionParams, ChannelActionRequest } from "./types";
import merge from 'lodash.merge';
import { CoreChannel } from "../CoreChannel";
import { ChannelAction } from "./ChannelAction";
import cuid from "cuid";

type Actions = ['MESSAGE'];
const Actions = ['MESSAGE'] as const;

const Events = {
    MESSAGE_REQUEST: 'MESSAGE_REQUEST',
    MESSAGE_CONFIRM: 'MESSAGE_CONFIRM',
    MESSAGE_ERROR: 'MESSAGE_ERROR',
} as const;

export class Message extends ChannelAction<Actions>{
    public readonly name = 'MESSAGE';
    public readonly actions = Actions as Actions;

    public setContext({ channel }: { channel: CoreChannel }) {
        this.channel = channel;
    }

    public MESSAGE_REQUEST: ChannelActionRequest = async (params) => {
        const type = Events.MESSAGE_REQUEST;
        const data = params?.data || {};
        const { eventId, ...meta } = params?.metadata || {}
        const metadata = { ...meta, messageId: cuid(), channelId: this.channel.channelId };
        const request = new ChannelRequestEvent({ type, metadata, data });
        await this.channel.sealEvent(request) as ChannelRequestEvent;
        const confirmEvent = await this.channel.dispatchRequest(request) as ChannelConfirmEvent;
        return confirmEvent;
    }

    public MESSAGE_CONFIRM: ChannelActionConfirm = async (requestEvent: ChannelRequestEvent) => {
        await this.channel.openEvent(requestEvent) as ChannelRequestEvent;
        const data = { ...requestEvent };
        const { eventId, ...meta } = requestEvent?.metadata || {}
        const confirmationEvent = new ChannelConfirmEvent({
            type: Events.MESSAGE_CONFIRM,
            metadata: merge({}, meta),
            data: data,
        });
        await this.channel.sealEvent(confirmationEvent);
        return Promise.resolve(confirmationEvent);
    }
}