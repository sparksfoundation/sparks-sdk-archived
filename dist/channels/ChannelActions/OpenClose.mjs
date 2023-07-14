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
    this.OPEN_REQUEST = async (params) => {
      const { eventId, ...meta } = params?.metadata || {};
      const request = new ChannelRequestEvent({
        type: Events.OPEN_REQUEST,
        metadata: { ...meta, channelId: this.channel.channelId },
        data: merge({}, params?.data, {
          peer: {
            identifier: this.channel.identifier,
            publicKeys: this.channel.publicKeys
          }
        })
      });
      const confirmEvent = await this.channel.dispatchRequest(request);
      await this.channel.setSharedKey(confirmEvent.data.peer.publicKeys.cipher);
      this.channel.peer.publicKeys = confirmEvent.data.peer.publicKeys;
      this.channel.state.status = "OPEN";
      return confirmEvent;
    };
    this.OPEN_CONFIRM = async (requestEvent) => {
      await this.channel.setSharedKey(requestEvent.data.peer.publicKeys.cipher);
      this.channel.peer.publicKeys = requestEvent.data.peer.publicKeys;
      this.channel.state.status = "OPEN";
      const { eventId, ...meta } = requestEvent?.metadata || {};
      const confirmEvent = new ChannelConfirmEvent({
        type: Events.OPEN_CONFIRM,
        metadata: merge({}, meta),
        data: merge({}, requestEvent?.data, {
          peer: {
            identifier: this.channel.identifier,
            publicKeys: this.channel.publicKeys
          }
        })
      });
      return Promise.resolve(confirmEvent);
    };
    this.CLOSE_REQUEST = async (params) => {
      const { eventId, ...meta } = params?.metadata || {};
      const request = new ChannelRequestEvent({
        type: Events.CLOSE_REQUEST,
        metadata: { ...meta, channelId: this.channel.channelId },
        data: merge({}, params?.data)
      });
      this.channel.state.status = "CLOSED";
      return await this.channel.dispatchRequest(request);
    };
    this.CLOSE_CONFIRM = async (requestEvent) => {
      this.channel.state.status = "CLOSED";
      const { eventId, ...meta } = requestEvent?.metadata || {};
      const confirmEvent = new ChannelConfirmEvent({
        type: Events.CLOSE_CONFIRM,
        metadata: merge({}, meta),
        data: merge({}, requestEvent?.data)
      });
      await this.channel.sealEvent(confirmEvent);
      return Promise.resolve(confirmEvent);
    };
  }
  setContext({ channel }) {
    this.channel = channel;
    this.channel.state.status = "CLOSED";
    this.channel.requestPreflight((requestEvent) => {
      const type = requestEvent.type;
      const isAllowed = ["OPEN_REQUEST", "CLOSE_REQUEST"].includes(type);
      const isClosed = this.channel.state.status === "CLOSED";
      if (!isAllowed && isClosed)
        throw new Error("channel is closed");
    });
    this.channel.on([
      this.channel.eventTypes.CLOSE_CONFIRM,
      this.channel.errorTypes.REQUEST_TIMEOUT_ERROR
    ], (event) => {
      const closeConfirmed = event.type === "CLOSE_CONFIRM";
      const closeTimeout = event.type === "REQUEST_TIMEOUT_ERROR" && event.metadata.eventType === "CLOSE_REQUEST";
      if (closeConfirmed || closeTimeout) {
        this.channel.state.status = "CLOSED";
        this.channel.removeAllListeners();
      }
    });
  }
}
