"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchAPI = void 0;
var _Channel = require("../Channel/Channel.cjs");
var _types = require("../Channel/types.cjs");
class FetchAPI extends _Channel.Channel {
  constructor({
    url,
    ...args
  }) {
    super({
      channelType: _types.ChannelTypes.FETCH_API,
      ...args
    });
    this.url = url;
    this.sendMessage = this.sendMessage.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);
  }
  async sendMessage(payload) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    if (json.error) throw new Error(json.error);
    this.receiveMessage(json);
  }
  static async receive() {
    throw new Error("Fetch channels are outgoing only");
  }
}
exports.FetchAPI = FetchAPI;