import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent/index.mjs";
import merge from "lodash.merge";
import { ChannelAction } from "./ChannelAction.mjs";
const Actions = ["OPEN", "CLOSE"];
const Events = {
  OPEN_REQUEST: "OPEN_REQUEST",
  OPEN_CONFIRM: "OPEN_CONFIRM",
  OPEN_ERROR: "OPEN_ERROR",
  CLOSE_REQUEST: "CLOSE_REQUEST",
  CLOSE_CONFIRM: "CLOSE_CONFIRM",
  CLOSE_ERROR: "CLOSE_ERROR"
};
export class OpenClose extends ChannelAction {
  constructor() {
    super(...arguments);
    this.name = "OPEN_CLOSE";
    this.actions = Actions;
    this.status = "CLOSED";
    this.OPEN_REQUEST = async (params) => {
      const type = Events.OPEN_REQUEST;
      const metadata = { ...params?.metadata, channelId: this.channel.channelId };
      const data = merge({}, params?.data, {
        peer: {
          identifier: this.channel.identifier,
          publicKeys: this.channel.publicKeys
        }
      });
      const request = new ChannelRequestEvent({ type, metadata, data });
      const confirmEvent = await this.channel.dispatchRequest(request);
      await this.channel.setSharedKey(confirmEvent.data.peer.publicKeys.cipher);
      this.channel.peer.publicKeys = confirmEvent.data.peer.publicKeys;
      this.status = "OPEN";
      return confirmEvent;
    };
    this.OPEN_CONFIRM = async (requestEvent) => {
      const { eventId, ...meta } = requestEvent?.metadata || {};
      return Promise.resolve(new ChannelConfirmEvent({
        type: Events.OPEN_CONFIRM,
        metadata: merge({}, meta),
        data: merge({}, requestEvent?.data, {
          peer: {
            identifier: this.channel.identifier,
            publicKeys: this.channel.publicKeys
          }
        })
      }));
    };
    this.CLOSE_REQUEST = async (params) => {
      const type = Events.CLOSE_REQUEST;
      const data = params?.data || {};
      const metadata = { ...params?.metadata, channelId: this.channel.channelId };
      const request = new ChannelRequestEvent({ type, metadata, data });
      this.status = "CLOSED";
      const confirmEvent = await this.channel.dispatchRequest(request);
      return confirmEvent;
    };
    this.CLOSE_CONFIRM = async (requestEvent) => {
      this.status = "CLOSED";
      const { eventId, ...meta } = requestEvent?.metadata || {};
      return Promise.resolve(new ChannelConfirmEvent({
        type: Events.CLOSE_CONFIRM,
        metadata: merge({}, meta),
        data: merge({}, requestEvent?.data)
      }));
    };
  }
  setContext({ channel }) {
    this.channel = channel;
    this.channel.requestPreflight((requestEvent) => {
      const type = requestEvent.type;
      const isAllowed = ["OPEN_REQUEST", "CLOSE_REQUEST"].includes(type);
      const isClosed = this.status === "CLOSED";
      if (!isAllowed && isClosed)
        throw new Error("channel is closed");
    });
  }
}
