import { ChannelErrors } from "../../errors";
import { SparkConfirmEvent, SparkEvent, SparkRequestEvent, createEvent } from "../../events/SparkEvent";
import { SparkChannel } from "../SparkChannel";
import { ChannelReceive, RequestOptions, RequestParams, SparkChannelActions, SparkChannelInterface } from "../SparkChannel/types";
import { PostMessageExport, PostMessageParams } from "./types";

export class PostMessage extends SparkChannel implements SparkChannelInterface<SparkChannelActions> {
  constructor(params: PostMessageParams) {
    const type = 'PostMessage';
    const { _window, source, peer, ...rest } = params;
    super({ ...rest, type, peer });

    this.peer.url = peer?.url || peer?.origin;
    this.peer.origin = peer?.origin || new URL(peer?.url).origin;
    this.state.window = _window || window;
    this.state.source = source;

    this.handleEvent = this.handleEvent.bind(this);
    this.state.window.addEventListener('message', this.handleEvent);
    this.state.window.addEventListener('beforeunload', async () => {
      await this.close();
      this.state.window.removeEventListener('message', this.handleEvent);
    })
  }

  public async open(params: RequestParams = {}) {
    if (!this.state.source) {
      this.state.source = this.state.window.open(this.peer.url, '_blank');
    }
    const { data, ...rest } = params;
    return await super.open({ data: { ...data, url: this.state.window.href, origin: this.state.window.origin }, ...rest });
  }

  public async onOpenRequested(request: SparkRequestEvent) {
    this.peer.url = request.data.url || request.data.origin;
    this.peer.origin = request.data.origin || new URL(request.data.url).origin;
    await super.onOpenRequested(request);
  }

  public async confirmOpen(request: SparkRequestEvent) {
    request.data.origin = this.state.window.origin;
    request.data.url = this.state.window.href;
    await super.confirmOpen(request);
  }

  public async close(params: RequestParams = {}, options?: RequestOptions) {
    return new Promise<SparkConfirmEvent>((resolve, reject) => {
      super.close(params, options)
        .then(resolve)
        .catch(error => {
          this.onCloseConfirmed(null as any);
          reject(error);
        })
    });
  }

  public async onCloseConfirmed(confirm: SparkConfirmEvent) {
    await super.onCloseConfirmed(confirm);
    this.state.window.removeEventListener('message', this.handleEvent);
    this.state.source = null;
  }

  public async onCloseRequested(request: SparkRequestEvent) {
    await super.onCloseRequested(request);
    this.state.source = null;
    this.state.window.removeEventListener('message', this.handleEvent);
  }

  public async handleEvent(payload: any) {
    await super.handleEvent(payload.data as SparkEvent);
  }

  public sendEvent(event: SparkEvent) {
    this.state.source.postMessage(event, this.peer.origin);
    return Promise.resolve();
  }

  public export(): PostMessageExport {
    return {
      ...super.export(),
      type: this.type,
      peer: { 
        ...this.peer, 
        origin: this.peer.origin,
        url: this.peer.url,
      },
    }
  }

  public async import(data: PostMessageExport) {
    super.import(data);
    if (!data?.peer) return;
    if (data.peer.origin || data.peer.url) {
      this.peer.origin = data.peer.origin || new URL(data.peer.url).origin;
      this.peer.url = data.peer.url || data.peer.origin;
    }
  }

  public static receive: ChannelReceive = (callback, options) => {
    const { _window, _source, spark } = options;
    const win = _window || window;
    win.addEventListener('message', async (event: any) => {
      const { source, origin } = event;
      const { type, data, metadata } = event.data;
      if (type !== 'OPEN_REQUEST') return;

      const confirmOpen = () => {
        return new Promise<PostMessage>(async (resolve, reject) => {
          const channel = new PostMessage({
            _window: win,
            channelId: metadata.channelId,
            peer: { ...data.peer, origin: origin || _source.origin },
            source: _source || source,
            spark: spark,
          });

          channel.on(channel.eventTypes.ANY_ERROR, async (event) => {
            return reject(event);
          });

          await channel.handleEvent(event);
          return resolve(channel);
        });
      }

      const rejectOpen = () => {
        const error = ChannelErrors.CHANNEL_REJECT_OPEN_REQUEST_ERROR(event.data);
        (_source || source).postMessage(error, origin);
      }

      return callback({ event: event.data, confirmOpen, rejectOpen });
    });
  }


}
