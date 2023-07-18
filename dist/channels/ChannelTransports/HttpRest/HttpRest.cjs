"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpRest = void 0;
var _channel = require("../../../errors/channel.cjs");
var _CoreChannel = require("../../CoreChannel.cjs");
const _HttpRest = class extends _CoreChannel.CoreChannel {
  constructor({
    peer,
    ...params
  }) {
    const type = "HttpRest";
    super({
      ...params,
      type,
      peer
    });
    this.peer.origin = peer.origin;
  }
};
let HttpRest = _HttpRest;
exports.HttpRest = HttpRest;
HttpRest.channels = /* @__PURE__ */new Map();
HttpRest.receive = (callback, options) => {
  _HttpRest.requestHandler = async event => {
    return new Promise(async (resolveRequest, rejectRequest) => {
      const {
        type,
        data,
        metadata
      } = event;
      const {
        eventId,
        nextEventId,
        channelId
      } = metadata;
      if (!eventId || !channelId || !type) {
        const error = _channel.ChannelErrors.InvalidEventTypeError({
          metadata
        });
        return rejectRequest(error);
      }
      if (type !== "OPEN_REQUEST") {
        const channel = _HttpRest.channels.get(metadata.channelId);
        if (!channel) {
          const error = _channel.ChannelErrors.ChannelNotFoundError({
            metadata
          });
          return rejectRequest(error);
        }
        channel.sendEvent = async event2 => {
          resolveRequest(event2);
        };
        channel.handleEvent(event);
        return;
      }
      const confirmOpen = () => {
        return new Promise(async (resolveChannel, rejectChannel) => {
          const channel = new _HttpRest({
            channelId: metadata.channelId,
            peer: {
              ...data.origin
            },
            spark: options.spark
          });
          channel.on(channel.errorTypes.ANY_ERROR, async event2 => {
            return rejectChannel(event2);
          });
          channel.sendEvent = async event2 => {
            resolveRequest(event2);
          };
          await channel.handleEvent(event);
          _HttpRest.channels.set(channelId, channel);
          return resolveChannel(channel);
        });
      };
      const rejectOpen = () => {
        const error = _channel.ChannelErrors.OpenRejectedError({
          metadata: {
            channelId: metadata.channelId
          },
          message: "Channel rejected"
        });
        resolveRequest(event);
      };
      return callback({
        event: event.data,
        confirmOpen,
        rejectOpen
      });
    });
  };
};