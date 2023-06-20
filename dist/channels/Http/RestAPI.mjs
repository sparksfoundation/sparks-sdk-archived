import { Channel } from "../Channel/Channel.mjs";
import { ChannelTypes } from "../Channel/types.mjs";
const _RestAPI = class extends Channel {
  constructor({ ...args }) {
    super({ channelType: ChannelTypes.REST_API, ...args });
    this.receiveMessage = this.receiveMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    _RestAPI.receives.set(this.channelId, this.receiveMessage);
  }
  async sendMessage(payload) {
    const { eventId } = payload;
    if (eventId) {
      const promise = _RestAPI.promises.get(eventId);
      if (promise)
        promise.resolve(payload);
    }
  }
  static receive(callback, { spark }) {
    if (!spark || !callback) {
      throw new Error("missing required arguments: spark, callback");
    }
    _RestAPI.eventHandler = async (payload) => {
      return new Promise((resolve, reject) => {
        const eventId = payload.eventId;
        const eventType = payload.eventType;
        const channelId = payload.channelId;
        if (!eventId || !eventType || !channelId) {
          return reject({ error: "Invalid payload" });
        }
        _RestAPI.promises.set(eventId, { resolve, reject });
        const receive = _RestAPI.receives.get(channelId);
        if (receive)
          return receive(payload);
        if (eventType === "open_request") {
          const args = Channel.channelRequest({
            payload,
            options: {
              spark
            },
            Channel: _RestAPI
          });
          if (args)
            return callback(args);
        }
      });
    };
  }
};
export let RestAPI = _RestAPI;
RestAPI.promises = /* @__PURE__ */ new Map();
RestAPI.receives = /* @__PURE__ */ new Map();
