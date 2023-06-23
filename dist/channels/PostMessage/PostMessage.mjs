import { AChannel, Channel, SparksChannel } from "../Channel/index.mjs";
export class PostMessage extends AChannel {
  constructor({
    _window,
    source,
    origin,
    spark,
    channel,
    ...args
  }) {
    super(spark);
    this._window = _window || window || null;
    if (!this._window)
      throw new Error("PostMessage: missing window");
    this.origin = origin;
    this.source = source;
    this.channel = channel ? channel : new Channel({ spark });
    this.sendRequests = this.sendRequests.bind(this);
    this.handleResponses = this.handleResponses.bind(this);
    this.channel.sendRequests(this.sendRequests);
    this._window.addEventListener("message", this.handleResponses);
  }
  open() {
    return this.channel.open();
  }
  close() {
    return this.channel.close();
  }
  send(message) {
    return this.channel.send(message);
  }
  handleResponses(event) {
    const payload = event.data;
    return this.channel.handleResponses(payload);
  }
  sendRequests(event) {
    this.source.postMessage(event, this.origin);
    return true;
  }
  static receive(callback, { spark, _window }) {
    const win = _window || window;
    win.addEventListener("message", async (event) => {
      const { type, cid } = event.data;
      if (type !== SparksChannel.EventTypes.OPEN_REQUEST)
        return;
      callback({
        details: event.data,
        resolve: async () => {
          const channel = new Channel({ spark, cid });
          const postMessage = new PostMessage({ _window: win, source: event.source, origin: event.origin, spark, channel });
          await channel.onOpenRequested(event.data);
          return postMessage;
        },
        reject: async (event2) => {
          const channel = new Channel({ spark, cid });
          return null;
        }
      });
    });
  }
}
