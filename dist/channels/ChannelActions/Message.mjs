import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "../ChannelEvent/index.mjs";
import merge from "lodash.merge";
import { ChannelAction } from "./ChannelAction.mjs";
import cuid from "cuid";
const Actions = ["MESSAGE"];
const Events = {
  MESSAGE_REQUEST: "MESSAGE_REQUEST",
  MESSAGE_CONFIRM: "MESSAGE_CONFIRM",
  MESSAGE_ERROR: "MESSAGE_ERROR"
};
export class Message extends ChannelAction {
  constructor() {
    super(...arguments);
    this.name = "MESSAGE";
    this.actions = Actions;
    this.MESSAGE_REQUEST = async (params) => {
      const type = Events.MESSAGE_REQUEST;
      const data = params?.data || {};
      const ids = ChannelEvent._getEventIds();
      const metadata = { ...params?.metadata, ...ids, messageId: cuid(), channelId: this.channel.channelId };
      const request = new ChannelRequestEvent({ type, metadata, data });
      await this.channel.sealEvent(request);
      const confirmEvent = await this.channel.dispatchRequest(request);
      return confirmEvent;
    };
    this.MESSAGE_CONFIRM = async (requestEvent) => {
      await this.channel.openEvent(requestEvent);
      const data = { ...requestEvent };
      const ids = ChannelEvent._getEventIds();
      const confirmationEvent = new ChannelConfirmEvent({
        type: Events.MESSAGE_CONFIRM,
        metadata: merge({}, requestEvent?.metadata, ids),
        data
      });
      await this.channel.sealEvent(confirmationEvent);
      return Promise.resolve(confirmationEvent);
    };
  }
  setContext({ channel }) {
    this.channel = channel;
  }
}