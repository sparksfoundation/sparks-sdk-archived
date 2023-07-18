import { ChannelErrors } from "../../../errors/channel.mjs";
import { CoreChannel } from "../../CoreChannel.mjs";
const _PostMessage = class extends CoreChannel {
  constructor(params) {
    const type = "PostMessage";
    const { _window, source, peer, ...rest } = params;
    super({ ...rest, type, peer });
    this.peer.url = peer.url || peer.origin;
    this.peer.origin = peer.origin || new URL(peer.url).origin;
    this.state.window = _window || window;
    this.state.source = source;
    this.handleEvent = this.handleEvent.bind(this);
    this.state.window.addEventListener("message", this.handleEvent);
    this.state.window.addEventListener("beforeunload", async () => {
      await this.close();
      this.state.window.removeEventListener("message", this.handleEvent);
    });
  }
  async open(params = {}) {
    if (!this.state.source) {
      this.state.source = this.state.window.open(this.peer.url, "_blank");
    }
    const { data, ...rest } = params;
    return await super.open({ data: { ...data, url: this.state.window.href, origin: this.state.window.origin }, ...rest });
  }
  async onOpenRequested(request) {
    this.peer.url = request.data.url || request.data.origin;
    this.peer.origin = request.data.origin || new URL(request.data.url).origin;
    await super.onOpenRequested(request);
  }
  async confirmOpen(request) {
    request.data.origin = this.state.window.origin;
    request.data.url = this.state.window.href;
    await super.confirmOpen(request);
  }
  async close(params = {}) {
    return new Promise((resolve, reject) => {
      super.close(params).then(resolve).catch((error) => {
        this.onCloseConfirmed(null);
        reject(error);
      });
    });
  }
  async onCloseConfirmed(confirm) {
    await super.onCloseConfirmed(confirm);
    this.state.window.removeEventListener("message", this.handleEvent);
    this.state.source = null;
  }
  async onCloseRequested(request) {
    await super.onCloseRequested(request);
    this.state.source = null;
    this.state.window.removeEventListener("message", this.handleEvent);
  }
  async handleEvent(event) {
    await super.handleEvent(event.data);
  }
  sendEvent(event) {
    this.state.source.postMessage(event, this.peer.origin);
    return Promise.resolve();
  }
  export() {
    return {
      ...super.export(),
      type: this.type,
      peer: {
        ...this.peer,
        origin: this.peer.origin,
        url: this.peer.url
      }
    };
  }
  async import(data) {
    super.import(data);
    this.peer.origin = data.peer.origin || new URL(data.peer.url).origin;
    this.peer.url = data.peer.url || data.peer.origin;
  }
};
export let PostMessage = _PostMessage;
PostMessage.receive = (callback, options) => {
  const { _window, _source, spark } = options;
  const win = _window || window;
  win.addEventListener("message", async (event) => {
    const { source, origin } = event;
    const { type, data, metadata } = event.data;
    if (type !== "OPEN_REQUEST")
      return;
    const confirmOpen = () => {
      return new Promise(async (resolve, reject) => {
        const channel = new _PostMessage({
          _window: win,
          channelId: metadata.channelId,
          peer: { ...data.peer, origin: origin || _source.origin },
          source: _source || source,
          spark
        });
        channel.on(channel.errorTypes.ANY_ERROR, async (event2) => {
          return reject(event2);
        });
        await channel.handleEvent(event);
        return resolve(channel);
      });
    };
    const rejectOpen = () => {
      const error = ChannelErrors.OpenRejectedError({
        metadata: { channelId: metadata.channelId },
        message: "Channel rejected"
      });
      source.postMessage(error, origin);
    };
    return callback({ event: event.data, confirmOpen, rejectOpen });
  });
};
