import { ChannelEvent } from "../../ChannelEvent";
import { CoreChannel } from "../../CoreChannel";
import { ChannelReceive, CoreChannelActions, CoreChannelInterface } from "../../types";
import { PostMessageExport, PostMessageParams } from "./types";

export class PostMessage extends CoreChannel implements CoreChannelInterface<CoreChannelActions>{
  constructor(params: PostMessageParams) {
    const type = 'PostMessage';
    const { _window, source, peer, ...rest } = params;
    super({ ...rest, type, peer });

    this.peer.origin = peer.origin;
    this.state.window = _window || window;
    this.state.source = source;

    this.handleEvent = this.handleEvent.bind(this);
    this.state.window.addEventListener('message', this.handleEvent);
    this.state.window.addEventListener('beforeunload', async () => {
      await this.close();
      this.state.window.removeEventListener('message', this.handleEvent);
    })
  }

  public async open() {
    if (!this.state.source) {
      this.state.source = this.state.window.open(this.peer.origin, '_blank');
    }
    const confirm = await super.open({ data: { origin: this.state.window.origin } });
    this.peer.origin = confirm.data.origin;
    return confirm
  }

  public async confirmOpen(request) {
    this.peer.origin = request.data.origin;
    request.data.origin = this.state.window.origin;
    const confirm = await super.confirmOpen(request);
    return confirm
  }

  public async close() {
    const confirm = await super.close();
    this.state.window.removeEventListener('message', this.handleEvent);
    this.state.source = null;
    return confirm
  }

  public async confirmClose(request) {
    const confirm = await super.confirmClose(request);
    return confirm
  }

  public async handleEvent(event) {
    if (event.type === this.confirmTypes.CLOSE_CONFIRM) {
      this.state.source = null;
      this.state.window.removeEventListener('message', this.handleEvent);
    }
    return await super.handleEvent(event.data as ChannelEvent);
  }

  // specify how request events are sent out
  public sendEvent(event: ChannelEvent) {
    this.state.source.postMessage(event, this.peer.origin);
    return Promise.resolve();
  }

  public export(): PostMessageExport {
    return {
      ...super.export(),
      type: 'PostMessage',
      peer: { ...this.peer, origin: this.peer.origin },
    }
  }

  public async import(data: PostMessageExport) {
    super.import(data);
    this.peer.origin = data.peer.origin;
  }

  public static receive: ChannelReceive = (callback, options) => {
    const { _window, _source, spark } = options;
    const win = _window || window;
    win.addEventListener('message', async (event) => {
      const { source, origin } = event;
      const { type, data, metadata } = event.data;
      if (type !== 'OPEN_REQUEST') return;

      const confirmOpen = () => {
        return new Promise<PostMessage>(async (resolve, reject) => {
          const channel = new PostMessage({
            _window: win,
            channelId: metadata.channelId,
            peer: { ...data.peer, origin: origin },
            source: _source || source,
            spark: spark,
          });

          channel.on(channel.errorTypes.ANY_ERROR, async (event) => {
            return reject(event);
          });

          await channel.handleEvent(event);
          return resolve(channel);
        });
      }

      return callback({ event: event.data, confirmOpen });
    });
  }
}