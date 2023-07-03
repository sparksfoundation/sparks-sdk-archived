"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchAPI = void 0;
var _CoreChannel = require("../CoreChannel.cjs");
var _types = require("../types.cjs");
class FetchAPI extends _CoreChannel.CoreChannel {
  constructor({
    spark,
    url,
    cid,
    eventLog,
    peer
  }) {
    super({
      spark,
      cid,
      eventLog,
      peer
    });
    this._url = url;
    this._origin = origin || new URL(url).origin;
    this.sendRequest = this.sendRequest.bind(this);
  }
  get url() {
    return this._url;
  }
  get origin() {
    return this._origin;
  }
  async sendRequest(request) {
    const response = await fetch(this._url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });
    const json = await response.json();
    if (!json.error) super.handleResponse(json);
  }
  static receive() {
    throw new Error("Fetch channels are outgoing only");
  }
  async export() {
    const data = await super.export();
    const url = this._url;
    const origin2 = this._origin;
    return Promise.resolve({
      ...data,
      url,
      origin: origin2
    });
  }
  async import(data) {
    await super.import(data);
    this._url = data.url;
    this._origin = data.origin;
  }
}
exports.FetchAPI = FetchAPI;
FetchAPI.type = _types.ChannelType.FETCH_API_CHANNEL;