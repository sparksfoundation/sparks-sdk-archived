import { ISpark } from "../../Spark";
import { AChannel, Channel, SparksChannel } from "../Channel";

export class PostMessage extends AChannel {
  private source: Window;
  private origin: string;
  private _window?: Window;

  constructor({
    _window,
    source,
    origin,
    spark,
    channel,
    ...args
  }: {
    _window?: Window,
    source: Window,
    origin: string,
    spark: ISpark<any, any, any, any, any>,
    channel?: Channel,
    args?: any
  }) {
    super(spark)
    this._window = _window || window || null;
    if (!this._window) throw new Error('PostMessage: missing window');

    this.origin = origin;
    this.source = source;
    this.channel = channel ? channel : new Channel({ spark })

    this.sendRequests = this.sendRequests.bind(this);
    this.handleResponses = this.handleResponses.bind(this);
    this.channel.sendRequests(this.sendRequests);
    this._window.addEventListener('message', this.handleResponses);
  }

  protected open() {
    return this.channel.open();
  }

  protected close() {
    return this.channel.close();
  }

  protected send(message) {
    return this.channel.send(message);
  }

  protected handleResponses(event) {
    const payload = event.data;
    return this.channel.handleResponses(payload);
  }

  protected sendRequests(event) {
    this.source.postMessage(event, this.origin);
    return true;
  }

  public static receive(callback: ({ details, resolve, reject }) => true | void, { spark, _window }: { spark: ISpark<any, any, any, any, any>, _window?: Window }) {
    const win = _window || window;
    win.addEventListener('message', async (event) => {
      const { type, cid } = event.data;
      if (type !== SparksChannel.EventTypes.OPEN_REQUEST) return;
      callback({
        details: event.data,
        resolve: async () => {
          const channel = new Channel({ spark, cid });
          const postMessage = new PostMessage({ _window: win, source: event.source as Window, origin: event.origin, spark, channel });
          await channel.onOpenRequested(event.data);
          return postMessage;
        },
        reject: async (event) => {
          const channel = new Channel({ spark, cid });
          //await channel.rejectOpen(event.data);
          return null;
        }
      })
    });
  }
}