import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent";
import { CoreChannel } from "../CoreChannel";
import { ChannelAction } from "./ChannelAction";
import { ChannelActionRequest } from "./types";
import merge from 'lodash.merge';

type Actions = ['CALL', 'HANGUP']
const Actions = ['CALL', 'HANGUP'] as const;

const Events = {
  CALL_REQUEST: 'CALL_REQUEST',
  CALL_CONFIRM: 'CALL_CONFIRM',
  HANGUP_REQUEST: 'HANGUP_REQUEST',
  HANGUP_CONFIRM: 'HANGUP_CONFIRM',
} as const;

export class CallHangUp extends ChannelAction<Actions> {
  public readonly name = 'CALL_HANGUP';
  public readonly actions = Actions as Actions;

  public setContext({ channel }: { channel: CoreChannel; }): void {
    this.channel = channel;
  }

  public CALL_REQUEST: ChannelActionRequest = async (params: any) => {
    // dispatch request and await confirmation
    const { eventId, ...meta } = params?.metadata || {}
    const request = new ChannelRequestEvent({
      type: Events.CALL_REQUEST,
      metadata: { ...meta, channelId: this.channel.channelId },
      data: merge({}, params?.data)
    });

    const confirmEvent = await this.channel.dispatchRequest(request) as ChannelConfirmEvent;
    return confirmEvent;
  }

  public CALL_CONFIRM: ChannelActionRequest = async (params: any) => {
    const { eventId, ...meta } = params?.metadata || {}
    const confirmEvent = new ChannelConfirmEvent({
      type: Events.CALL_CONFIRM,
      metadata: merge({}, meta),
      data: merge({}, params?.data)
    });
    await this.channel.sealEvent(confirmEvent);
    return Promise.resolve(confirmEvent);
  }

  public HANGUP_REQUEST: ChannelActionRequest = async (params: any) => {
    // dispatch request and await confirmation
    const { eventId, ...meta } = params?.metadata || {}
    const request = new ChannelRequestEvent({
      type: Events.CALL_REQUEST,
      metadata: { ...meta, channelId: this.channel.channelId },
      data: merge({}, params?.data)
    });

    const confirmEvent = await this.channel.dispatchRequest(request) as ChannelConfirmEvent;
    return confirmEvent;
  }

  public HANGUP_CONFIRM: ChannelActionRequest = async (params: any) => {
    const data = params?.data || {};
    const { eventId, ...metadata } = params?.metadata || {};
    const confirmEvent = new ChannelConfirmEvent({ type: 'HANGUP_CONFIRM', metadata, data });
    await this.channel.sealEvent(confirmEvent);
    return Promise.resolve(confirmEvent);
  }
}