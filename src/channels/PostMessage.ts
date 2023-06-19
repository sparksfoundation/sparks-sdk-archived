import { Spark } from "../Spark.js";
import { Channel } from "./Channel.js";
import { ChannelTypes } from "./types.js";

export class PostMessage extends Channel {
  private source: Window;
  private origin: string;
  private _window?: Window;

  constructor({
    _window,
    source,
    origin,
    spark,
    ...args
  }: {
    _window?: Window,
    source: Window,
    origin: string,
    spark: Spark,
    args?: any
  }) {
    super({ channelType: ChannelTypes.POST_MESSAGE, spark, ...args });
    this._window = _window || window || null;
    if (!this._window) throw new Error('PostMessage: missing window');
    this.origin = origin;
    this.source = source;
    this._window.addEventListener('message', this.receiveMessage);
  }

  protected sendMessage(event: any) {
    // how do we send messages out
    this.source.postMessage(event, this.origin);
  }

  protected receiveMessage(payload: any) {
    // how do we receive messages
    super.receiveMessage(payload.data);
  }

  static receive(callback, { spark, _window }) {
    // how do we receive messages as a recipient
    const win = _window || window;
    win.addEventListener('message', (event) => {
      // todo normalize payload
      const source = event.source as Window;
      const origin = event.origin;
      const options = { _window: win, source, origin, spark };
      const request = Channel.channelRequest({
        payload: event.data,
        options,
        Channel: PostMessage,
      })
      if (request) callback(request);
    });
  }
}