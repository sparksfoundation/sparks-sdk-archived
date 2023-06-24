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
  }: {
    _window?: Window,
    source: Window,
    origin: string,
    spark: ISpark<any, any, any, any, any>,
    channel?: Channel,
  }) {
    super({ spark, channel })
    this._window = _window || window || null;
    if (!this._window) throw new Error('PostMessage: missing window');

    this.origin = origin;
    this.source = source;

    this.sendRequest = this.sendRequest.bind(this);
    this.channel.setRequestHandler(this.sendRequest);

    this.handleResponse = this.handleResponse.bind(this);
    this._window.addEventListener('message', this.handleResponse);
  }

  protected handleResponse(event) {
    console.log('handleResponse', event.data.type);
    const payload = event.data;
    return this.channel.handleResponse(payload);
  }

  protected async sendRequest(event) {
    console.log('sendRequest', event.type);
    this.source.postMessage(event, this.origin);
  }

  public static receive(callback: ({ details, resolve, reject }) => true | void, { spark, _window }: { spark: ISpark<any, any, any, any, any>, _window?: Window }) {
    const win = _window || window;
    if (!win || !spark || !callback) {
      throw new Error('missing required arguments: spark, callback');
    }
    
    win.addEventListener('message', async (event) => {
      const { type, cid } = event.data;
      if (type !== SparksChannel.Event.Types.OPEN_REQUEST) return;
      
      const channel = new PostMessage({ 
        _window: win, 
        source: event.source as Window, 
        origin: event.origin, 
        spark, 
        channel: new Channel({ spark, cid }) 
      });

      callback({
        details: event.data,
        resolve: async () => {
          await channel.acceptOpen(event.data);
          return channel;
        },
        reject: async () => {
          await channel.rejectOpen(event.data);
          return null;
        }
      })
    });
  }
}