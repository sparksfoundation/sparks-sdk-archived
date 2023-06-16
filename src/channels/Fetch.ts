import { Channel } from "./Channel.js";
import { ChannelTypes } from "./types.js";

export class Fetch extends Channel {
  private url: string;

  constructor({ url, ...args }: { url: string, args: any }) {
    super({ channelType: ChannelTypes.FETCH_API, ...args });
    this.url = url;
    this.sendMessage = this.sendMessage.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);
  }

  protected async sendMessage(payload: any) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (json.error) throw new Error(json.error);
    this.receiveMessage(json);
  }

  static async receive() {
    throw new Error("Fetch channels are outgoing only");
  }
}
