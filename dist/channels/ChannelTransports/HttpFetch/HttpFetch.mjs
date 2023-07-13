import { CoreChannel } from "../../CoreChannel.mjs";
import { OpenClose, Message } from "../../ChannelActions/index.mjs";
export class HttpFetch extends CoreChannel {
  constructor({ peer, ...params }) {
    super({ ...params, peer, actions: [new OpenClose(), new Message()] });
    this.type = "HttpFetch";
    this.peer.url = peer?.url;
    this.peer.origin = peer?.origin ? peer.origin : new URL(peer.url).origin;
    this.sendRequest = this.sendRequest.bind(this);
  }
  async open() {
    const action = this.getAction("OPEN_CLOSE");
    const confirmation = await action.OPEN_REQUEST();
    return confirmation;
  }
  message(message) {
    const action = this.getAction("MESSAGE");
    return action.MESSAGE_REQUEST({ data: message });
  }
  async sendRequest(request) {
    const response = await fetch(this.peer.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    const json = await response.json();
    if (!json.error)
      super.handleResponse(json);
  }
  static receive() {
    throw new Error("Fetch channels are outgoing only");
  }
}
