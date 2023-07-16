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
  async open() {
    if (!this.state.source) {
      this.state.source = this.state.window.open(this.peer.origin, "_blank");
    }
    const confirm = await super.open({ data: { origin: this.state.window.origin } });
    this.peer.origin = confirm.data.origin;
    return confirm;
  }
  async confirmOpen(request) {
    this.peer.origin = request.data.origin;
    request.data.origin = this.state.window.origin;
    const confirm = await super.confirmOpen(request);
    return confirm;
  }
  async close() {
    const confirm = await super.close();
    this.state.window.removeEventListener("message", this.handleEvent);
    this.state.source = null;
    return confirm;
  }
  async confirmClose(request) {
    const confirm = await super.confirmClose(request);
    return confirm;
  }
  async handleEvent(event) {
    if (event.type === this.confirmTypes.CLOSE_CONFIRM) {
      this.state.source = null;
      this.state.window.removeEventListener("message", this.handleEvent);
    }
    return await super.handleEvent(event.data);
  }
  // specify how request events are sent out
  sendEvent(event) {
    this.state.source.postMessage(event, this.peer.origin);
    return Promise.resolve();
  }
  export() {
    return {
      ...super.export(),
      type: "PostMessage",
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
          peer: { ...data.peer, origin },
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
