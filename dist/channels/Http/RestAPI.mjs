import { Channel, AChannel, SparksChannel } from "../Channel/index.mjs";
const _RestAPI = class extends AChannel {
  constructor({ spark, channel }) {
    super({ spark, channel });
    this.handleResponse = this.handleResponse.bind(this);
    this.handleRequest = this.handleRequest.bind(this);
    this.channel.setRequestHandler(this.handleRequest);
    _RestAPI.receives.set(this.cid, this.handleResponse);
  }
  async handleResponse(response) {
    await this.channel.handleResponse(response);
    const promise = _RestAPI.promises.get(response.eid);
    if (!promise)
      return;
    promise.resolve();
    _RestAPI.promises.delete(response.eid);
  }
  async handleRequest(request) {
    const promise = _RestAPI.promises.get(request.eid);
    promise.resolve(request);
    _RestAPI.promises.delete(request.eid);
  }
  static receive(callback, { spark }) {
    if (!spark || !callback) {
      throw new Error("missing required arguments: spark, callback");
    }
    _RestAPI.requestHandler = async (request) => {
      return new Promise((resolve, reject) => {
        const { eid, cid, type } = request;
        if (!eid || !cid || !type) {
          return reject({ error: "Invalid request" });
        }
        _RestAPI.promises.set(eid, { resolve, reject });
        const receive = _RestAPI.receives.get(cid);
        if (receive)
          return receive(request);
        if (type === SparksChannel.Event.Types.OPEN_REQUEST) {
          const channel = new _RestAPI({
            spark,
            channel: new Channel({ spark, cid })
          });
          callback({
            details: request,
            resolve: async () => {
              await channel.acceptOpen(request);
              return channel;
            },
            reject: async () => {
              await channel.rejectOpen(request);
              return null;
            }
          });
        }
      });
    };
  }
};
export let RestAPI = _RestAPI;
RestAPI.promises = /* @__PURE__ */ new Map();
RestAPI.receives = /* @__PURE__ */ new Map();
