"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpFetch = void 0;
var _CoreChannel = require("../../CoreChannel.cjs");
class HttpFetch extends _CoreChannel.CoreChannel {
  constructor({
    peer,
    ...params
  }) {
    const type = "HttpFetch";
    super({
      ...params,
      type,
      peer
    });
    this.peer.url = peer.url;
    this.peer.origin = peer?.origin ? peer.origin : new URL(peer.url).origin;
  }
  async sendEvent(request) {
    const response = await fetch(this.peer.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });
    const json = await response.json();
    if (!json.error) this.handleEvent(json);
  }
  static receive() {
    throw new Error("Fetch channels are outgoing only");
  }
}
exports.HttpFetch = HttpFetch;