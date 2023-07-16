import { ChannelErrors } from "../../../errors/channel.mjs";
import { CoreChannel } from "../../CoreChannel.mjs";
const _HttpRest = class extends CoreChannel {
  constructor({ peer, ...params }) {
    const type = "HttpRest";
    super({ ...params, type, peer });
    this.peer.origin = peer.origin;
  }
};
export let HttpRest = _HttpRest;
HttpRest.channels = /* @__PURE__ */ new Map();
HttpRest.receive = (callback, options) => {
  _HttpRest.requestHandler = async (event) => {
    return new Promise(async (resolveRequest, rejectRequest) => {
      const { type, data, metadata } = event;
      const { eventId, nextEventId, channelId } = metadata;
      if (!eventId || !channelId || !type) {
        const error = ChannelErrors.InvalidEventTypeError({ metadata });
        return rejectRequest(error);
      }
      if (type !== "OPEN_REQUEST") {
        const channel = _HttpRest.channels.get(metadata.channelId);
        if (!channel) {
          const error = ChannelErrors.ChannelNotFoundError({ metadata });
          return rejectRequest(error);
        }
        channel.sendEvent = async (event2) => {
          resolveRequest(event2);
        };
        channel.handleEvent(event);
        return;
      }
      const confirmOpen = () => {
        return new Promise(async (resolveChannel, rejectChannel) => {
          const channel = new _HttpRest({
            channelId: metadata.channelId,
            peer: { ...data.origin },
            spark: options.spark
          });
          channel.on(channel.errorTypes.ANY_ERROR, async (event2) => {
            return rejectChannel(event2);
          });
          channel.sendEvent = async (event2) => {
            resolveRequest(event2);
          };
          await channel.handleEvent(event);
          _HttpRest.channels.set(channelId, channel);
          return resolveChannel(channel);
        });
      };
      return callback({ event: event.data, confirmOpen });
    });
  };
};
