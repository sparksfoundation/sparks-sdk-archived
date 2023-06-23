import { Channel } from "../Channel/Channel.mjs";
import { AChannel, ChannelTypes } from "../Channel/types.mjs";
export class PostMessage extends AChannel {
  constructor({
    _window,
    source,
    origin,
    spark,
    ...args
  }) {
    super({ channelType: ChannelTypes.POST_MESSAGE, spark, ...args });
    console.log(this);
    this._window = _window || window || null;
    if (!this._window)
      throw new Error("PostMessage: missing window");
    this.origin = origin;
    this.source = source;
    this._window.addEventListener("message", this.receiveMessage);
  }
  sendMessage(event) {
    this.source.postMessage(event, this.origin);
  }
  receiveMessage(payload) {
    this.channel.receiveMessage(payload.data);
  }
  static receive(callback, { spark, _window }) {
    const win = _window || window;
    win.addEventListener("message", (event) => {
      const source = event.source;
      const origin = event.origin;
      const options = { _window: win, source, origin, spark };
      const request = Channel.channelRequest({
        payload: event.data,
        options,
        Channel: PostMessage
      });
      if (request)
        callback(request);
    });
  }
}
