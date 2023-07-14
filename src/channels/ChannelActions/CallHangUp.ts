import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent";
import { ChannelAction } from "./ChannelAction";
import { ChannelActionRequest } from "./types";

type Actions = ['CALL', 'HANGUP']
const Actions = ['CALL', 'HANGUP'] as const;

export class CallHangUp extends ChannelAction<Actions> {
  public readonly name = 'CALL_HANGUP';
  public readonly actions = Actions as Actions;
  public CALL_REQUEST: ChannelActionRequest = async (params: any) => {
    return await this.channel.dispatchRequest(new ChannelRequestEvent({ ...params })) as ChannelConfirmEvent;
  }
  public CALL_CONFIRM: ChannelActionRequest = async (params: any) => {
    const data = params?.data || {};
    const { eventId, ...metadata } = params?.metadata || {};
    const confirmEvent = new ChannelConfirmEvent({ type: 'CALL_CONFIRM', metadata, data });
    await this.channel.sealEvent(confirmEvent);
    return Promise.resolve(confirmEvent);
  }
  public HANGUP_REQUEST: ChannelActionRequest = async (params: any) => {
    return await this.channel.dispatchRequest(new ChannelRequestEvent({ ...params })) as ChannelConfirmEvent;
  }
  public HANGUP_CONFIRM: ChannelActionRequest = async (params: any) => {
    const data = params?.data || {};
    const { eventId, ...metadata } = params?.metadata || {};
    const confirmEvent = new ChannelConfirmEvent({ type: 'HANGUP_CONFIRM', metadata, data });
    await this.channel.sealEvent(confirmEvent);
    return Promise.resolve(confirmEvent);
  }
}