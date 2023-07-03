import { CoreChannel } from "../CoreChannel.mjs";
import { ChannelEventType, ChannelType } from "../types.mjs";
const _RestAPI = class extends CoreChannel {
  constructor({ spark, cid, eventLog, peer }) {
    super({ spark, cid, eventLog, peer });
    this.sendRequest = this.sendRequest.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
    _RestAPI.receives.set(this.cid, this.handleResponse);
  }
  async handleResponse(response) {
    await super.handleResponse(response);
    const promise = _RestAPI.promises.get(response.eid);
    if (!promise)
      return;
    promise.resolve();
    _RestAPI.promises.delete(response.eid);
  }
  async sendRequest(request) {
    const promise = _RestAPI.promises.get(request.metadata.eid);
    promise.resolve(request);
    _RestAPI.promises.delete(request.metadata.eid);
  }
  static handleOpenRequests(callback, { spark }) {
    if (!spark || !callback) {
      throw new Error("missing required arguments: spark, callback");
    }
    _RestAPI.requestHandler = async (request) => {
      return new Promise((resolve, reject) => {
        const { type, metadata } = request;
        const { eid, cid } = metadata;
        if (!eid || !cid || !type) {
          return reject({ error: "Invalid request" });
        }
        _RestAPI.promises.set(eid, { resolve, reject });
        const receive = _RestAPI.receives.get(cid);
        if (receive)
          return receive(request);
        const isRequest = type === ChannelEventType.OPEN_REQUEST;
        if (!isRequest)
          return;
        const channel = new _RestAPI({
          spark,
          cid
        });
        channel.handleOpenRequested = callback;
        channel.handleResponse(request);
      });
    };
  }
};
export let RestAPI = _RestAPI;
RestAPI.promises = /* @__PURE__ */ new Map();
RestAPI.receives = /* @__PURE__ */ new Map();
RestAPI.type = ChannelType.REST_API_CHANNEL;
