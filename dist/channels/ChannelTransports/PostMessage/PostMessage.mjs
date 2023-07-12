import { CoreChannel } from "../../CoreChannel.mjs";
import { OpenClose, Message } from "../../ChannelActions/index.mjs";
const _PostMessage = class extends CoreChannel {
  constructor({ _window, source, peer, ...params }) {
    const openClose = new OpenClose();
    const message = new Message();
    super({ ...params, peer, actions: [openClose, message] });
    this.sendRequest = (event) => {
      this._source.postMessage(event, this.peer.origin);
      return Promise.resolve();
    };
    this.peer.origin = peer?.origin;
    this._window = _window || window || null;
    this._source = source;
    this.open = this.open.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
    this._window.addEventListener("message", (event) => {
      this.handleResponse(event.data);
    });
  }
  async open() {
    this._source = this._source || this._window.open(this.peer.origin, "_blank");
    const action = this.getAction("OPEN_CLOSE");
    const confirmation = await action.OPEN_REQUEST({
      data: { peer: { origin: this._window.origin } }
    });
    return confirmation;
  }
  close() {
    const action = this.getAction("OPEN_CLOSE");
    return action.CLOSE_REQUEST();
  }
  message(message) {
    const action = this.getAction("MESSAGE");
    return action.MESSAGE_REQUEST({ data: message });
  }
  async handleResponse(event) {
    await super.handleResponse(event);
    return Promise.resolve();
  }
};
export let PostMessage = _PostMessage;
PostMessage.receive = (callback, options) => {
  const { _window, _source, spark } = options;
  const win = _window || window;
  win.addEventListener("message", async (event) => {
    const { source, origin } = event;
    const { type, data, metadata, _source: _source2 } = event.data;
    if (type !== "OPEN_REQUEST")
      return;
    const confirmOpen = () => {
      return new Promise(async (resolve, reject) => {
        const channel = new _PostMessage({
          _window,
          peer: { ...data.peer },
          source: _source2 || source,
          spark,
          channelId: metadata.channelId
        });
        channel.on(channel.eventTypes.ANY_ERROR, async (event2) => {
          return reject(event2);
        });
        await channel.open();
        await channel.handleResponse(event.data);
        return resolve(channel);
      });
    };
    return callback({ event: event.data, confirmOpen });
  });
};
