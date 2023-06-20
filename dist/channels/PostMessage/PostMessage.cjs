"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PostMessage = void 0;
var _Channel = require("../Channel/Channel.cjs");
var _types = require("../Channel/types.cjs");
class PostMessage extends _Channel.Channel {
  constructor({
    _window,
    source,
    origin,
    spark,
    ...args
  }) {
    super({
      channelType: _types.ChannelTypes.POST_MESSAGE,
      spark,
      ...args
    });
    this._window = _window || window || null;
    if (!this._window) throw new Error("PostMessage: missing window");
    this.origin = origin;
    this.source = source;
    this._window.addEventListener("message", this.receiveMessage);
  }
  sendMessage(event) {
    this.source.postMessage(event, this.origin);
  }
  receiveMessage(payload) {
    super.receiveMessage(payload.data);
  }
  static receive(callback, {
    spark,
    _window
  }) {
    const win = _window || window;
    win.addEventListener("message", event => {
      const source = event.source;
      const origin = event.origin;
      const options = {
        _window: win,
        source,
        origin,
        spark
      };
      const request = _Channel.Channel.channelRequest({
        payload: event.data,
        options,
        Channel: PostMessage
      });
      if (request) callback(request);
    });
  }
}
exports.PostMessage = PostMessage;