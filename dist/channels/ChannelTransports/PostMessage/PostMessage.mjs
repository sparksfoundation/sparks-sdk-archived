import { CoreChannel } from "../../CoreChannel.mjs";
const _PostMessage = class extends CoreChannel {
  constructor(params) {
    const type = "PostMessage";
    const { _window, source, peer, ...rest } = params;
    super({ ...rest, type, peer });
    this.peer.origin = peer.origin;
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
      this.state.source = this.state.window.open(this.peer.origin, "_blank");
    }
    return await super.open({ data: { origin: this.state.window.origin }, ...params });
  }
  async onOpenRequested(request) {
    this.peer.origin = request.data.origin;
    await super.onOpenRequested(request);
  }
  async confirmOpen(request) {
    request.data.origin = this.state.window.origin;
    await super.confirmOpen(request);
  }
  async close() {
    return new Promise((resolve, reject) => {
      super.close().then(resolve).catch((error) => {
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
      peer: { ...this.peer, origin: this.peer.origin }
    };
  }
  async import(data) {
    super.import(data);
    this.peer.origin = data.peer.origin;
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
    return callback({ event: event.data, confirmOpen });
  });
};
