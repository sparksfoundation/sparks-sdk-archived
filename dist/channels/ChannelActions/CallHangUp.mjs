import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent/index.mjs";
import { ChannelAction } from "./ChannelAction.mjs";
import merge from "lodash.merge";
const Actions = ["CALL", "HANGUP"];
const Events = {
  CALL_REQUEST: "CALL_REQUEST",
  CALL_CONFIRM: "CALL_CONFIRM",
  HANGUP_REQUEST: "HANGUP_REQUEST",
  HANGUP_CONFIRM: "HANGUP_CONFIRM"
};
export class CallHangUp extends ChannelAction {
  constructor() {
    super(...arguments);
    this.name = "CALL_HANGUP";
    this.actions = Actions;
    this.CALL_REQUEST = async (params) => {
      const { eventId, ...meta } = params?.metadata || {};
      const request = new ChannelRequestEvent({
        type: Events.CALL_REQUEST,
        metadata: { ...meta, channelId: this.channel.channelId },
        data: merge({}, params?.data)
      });
      const confirmEvent = await this.channel.dispatchRequest(request);
      return confirmEvent;
    };
    this.CALL_CONFIRM = async (params) => {
      const { eventId, ...meta } = params?.metadata || {};
      const confirmEvent = new ChannelConfirmEvent({
        type: Events.CALL_CONFIRM,
        metadata: merge({}, meta),
        data: merge({}, params?.data)
      });
      await this.channel.sealEvent(confirmEvent);
      return Promise.resolve(confirmEvent);
    };
    this.HANGUP_REQUEST = async (params) => {
      const { eventId, ...meta } = params?.metadata || {};
      const request = new ChannelRequestEvent({
        type: Events.CALL_REQUEST,
        metadata: { ...meta, channelId: this.channel.channelId },
        data: merge({}, params?.data)
      });
      const confirmEvent = await this.channel.dispatchRequest(request);
      return confirmEvent;
    };
    this.HANGUP_CONFIRM = async (params) => {
      const data = params?.data || {};
      const { eventId, ...metadata } = params?.metadata || {};
      const confirmEvent = new ChannelConfirmEvent({ type: "HANGUP_CONFIRM", metadata, data });
      await this.channel.sealEvent(confirmEvent);
      return Promise.resolve(confirmEvent);
    };
  }
  setContext({ channel }) {
    this.channel = channel;
  }
}
