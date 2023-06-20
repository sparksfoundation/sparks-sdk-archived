"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RestAPI = void 0;
var _Channel = require("../Channel/Channel.cjs");
var _types = require("../Channel/types.cjs");
const _RestAPI = class extends _Channel.Channel {
  constructor({
    ...args
  }) {
    super({
      channelType: _types.ChannelTypes.REST_API,
      ...args
    });
    this.receiveMessage = this.receiveMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    _RestAPI.receives.set(this.channelId, this.receiveMessage);
  }
  async sendMessage(payload) {
    const {
      eventId
    } = payload;
    if (eventId) {
      const promise = _RestAPI.promises.get(eventId);
      if (promise) promise.resolve(payload);
    }
  }
  static receive(callback, {
    spark
  }) {
    if (!spark || !callback) {
      throw new Error("missing required arguments: spark, callback");
    }
    _RestAPI.eventHandler = async payload => {
      return new Promise((resolve, reject) => {
        const eventId = payload.eventId;
        const eventType = payload.eventType;
        const channelId = payload.channelId;
        if (!eventId || !eventType || !channelId) {
          return reject({
            error: "Invalid payload"
          });
        }
        _RestAPI.promises.set(eventId, {
          resolve,
          reject
        });
        const receive = _RestAPI.receives.get(channelId);
        if (receive) return receive(payload);
        if (eventType === "open_request") {
          const args = _Channel.Channel.channelRequest({
            payload,
            options: {
              spark
            },
            Channel: _RestAPI
          });
          if (args) return callback(args);
        }
      });
    };
  }
};
let RestAPI = _RestAPI;
exports.RestAPI = RestAPI;
RestAPI.promises = /* @__PURE__ */new Map();
RestAPI.receives = /* @__PURE__ */new Map();