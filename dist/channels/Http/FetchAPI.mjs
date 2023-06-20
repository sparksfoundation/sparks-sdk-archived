import { Channel } from "../Channel/Channel.mjs";
import { ChannelTypes } from "../Channel/types.mjs";
export class FetchAPI extends Channel {
  constructor({ url, ...args }) {
    super({ channelType: ChannelTypes.FETCH_API, ...args });
    this.url = url;
    this.sendMessage = this.sendMessage.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);
  }
  async sendMessage(payload) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    if (json.error)
      throw new Error(json.error);
    this.receiveMessage(json);
  }
  static async receive() {
    throw new Error("Fetch channels are outgoing only");
  }
}
