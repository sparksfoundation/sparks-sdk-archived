import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent/index.mjs";
import { ChannelAction } from "./ChannelAction.mjs";
const Actions = ["CALL", "HANGUP"];
export class CallHangUp extends ChannelAction {
  constructor() {
    super(...arguments);
    this.name = "CALL_HANGUP";
    this.actions = Actions;
    this.CALL_REQUEST = async (params) => {
      return await this.channel.dispatchRequest(new ChannelRequestEvent({ ...params }));
    };
    this.CALL_CONFIRM = async (params) => {
      const data = params?.data || {};
      const { eventId, ...metadata } = params?.metadata || {};
      const confirmEvent = new ChannelConfirmEvent({ type: "CALL_CONFIRM", metadata, data });
      await this.channel.sealEvent(confirmEvent);
      return Promise.resolve(confirmEvent);
    };
    this.HANGUP_REQUEST = async (params) => {
      return await this.channel.dispatchRequest(new ChannelRequestEvent({ ...params }));
    };
    this.HANGUP_CONFIRM = async (params) => {
      const data = params?.data || {};
      const { eventId, ...metadata } = params?.metadata || {};
      const confirmEvent = new ChannelConfirmEvent({ type: "HANGUP_CONFIRM", metadata, data });
      await this.channel.sealEvent(confirmEvent);
      return Promise.resolve(confirmEvent);
    };
  }
}
