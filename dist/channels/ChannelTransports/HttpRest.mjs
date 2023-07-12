import { CoreChannel } from "../CoreChannel.mjs";
import { OpenClose, Message } from "../ChannelActions/index.mjs";
const _HttpRest = class extends CoreChannel {
  constructor({ peer, ...params }) {
    super({ ...params, peer, actions: [new OpenClose(), new Message()] });
    this.sendRequest = this.sendRequest.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
    _HttpRest.receives.set(this.channelId, this.handleResponse);
  }
  async handleResponse(response) {
    await super.handleResponse(response);
    const promise = _HttpRest.promises.get(response.eventId);
    if (!promise)
      return;
    promise.resolve();
    _HttpRest.promises.delete(response.eventId);
  }
  open(event) {
    const action = this.getAction("OPEN_CLOSE");
    return action.OPEN_REQUEST(event);
  }
  async sendRequest(request) {
    const promise = _HttpRest.promises.get(request.metadata.eventId);
    promise.resolve(request);
    _HttpRest.promises.delete(request.metadata.eventId);
  }
};
export let HttpRest = _HttpRest;
HttpRest.promises = /* @__PURE__ */ new Map();
HttpRest.receives = /* @__PURE__ */ new Map();
HttpRest.receive = (callback, options) => {
  const { spark } = options;
  _HttpRest.requestHandler = async (event) => {
    return new Promise((resolve, reject) => {
      const { type, data, metadata } = event;
      const { eventId, channelId } = metadata;
      if (!eventId || !channelId || !type) {
        return reject({ error: "Invalid request" });
      }
      _HttpRest.promises.set(eventId, { resolve, reject });
      const receivePromise = _HttpRest.receives.get(channelId);
      if (receivePromise)
        return receivePromise(event);
      const isRequest = type === "OPEN_REQUEST";
      if (!isRequest)
        return;
      const confirmOpen = () => {
        return new Promise(async (resolve2, reject2) => {
          const channel = new _HttpRest({
            peer: { ...data.peer },
            spark,
            channelId: metadata.channelId
          });
          await channel.open(event);
          await channel.handleResponse(event);
          return resolve2(channel);
        });
      };
      return callback({ event, confirmOpen });
    });
  };
};
