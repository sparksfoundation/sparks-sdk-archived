import { AChannel, Channel, SparksChannel } from "../Channel/index.mjs";
export class PostMessage extends AChannel {
  constructor({
    _window,
    source,
    origin,
    spark,
    channel
  }) {
    super(spark);
    this._window = _window || window || null;
    if (!this._window)
      throw new Error("PostMessage: missing window");
    this.origin = origin;
    this.source = source;
    this.channel = channel ? channel : new Channel({ spark });
    this.sendRequest = this.sendRequest.bind(this);
    this.channel.setSendRequest(this.sendRequest);
    this.handleResponse = this.handleResponse.bind(this);
    this._window.addEventListener("message", this.handleResponse);
  }
  handleResponse(event) {
    const payload = event.data;
    return this.channel.handleResponses(payload);
  }
  async sendRequest(event) {
    this.source.postMessage(event, this.origin);
  }
  static receive(callback, { spark, _window }) {
    const win = _window || window;
    if (!win)
      throw new Error("PostMessage: missing window");
    win.addEventListener("message", async (event) => {
      const { type, cid } = event.data;
      if (type !== SparksChannel.Event.Types.OPEN_REQUEST)
        return;
      const channel = new PostMessage({
        _window: win,
        source: event.source,
        origin: event.origin,
        spark,
        channel: new Channel({ spark, cid })
      });
      callback({
        details: event.data,
        resolve: async () => {
          const opend = await channel.acceptOpen(event.data);
          return channel;
        },
        reject: async () => {
          await channel.rejectOpen(event.data);
          return null;
        }
      });
    });
  }
}
