import { Channel } from "./Channel.js";
import { ChannelTypes } from "./types.js";

export class Fetch extends Channel {
  private url: string;

  constructor({ url, ...args }: { url: string, args: any }) {
    super({ channelType: ChannelTypes.FETCH_API, ...args });
    this.url = url;
    this.sendMessage = this.sendMessage.bind(this);
    this.recieveMessage = this.recieveMessage.bind(this);
  }

  protected async sendMessage(payload: any) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    console.log(text)
    //this.recieveMessage(await response.json());
  }

  protected recieveMessage(payload: any) {
    console.log(payload)
    super.recieveMessage(payload);
  }

  static async receive(callback, url) {
    throw new Error("Fetch channels are outgoing only");
  }
}
