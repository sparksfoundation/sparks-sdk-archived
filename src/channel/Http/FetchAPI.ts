import { Spark } from "../../Spark";
import { ChannelCore } from "../ChannelCore";
import { AnyChannelEvent, ChannelEventType, ChannelId, HandleOpenRequested } from "../types";

export class FetchAPI extends ChannelCore {
  private url: string;

  constructor({ spark, url, cid }: { 
    spark: Spark<any, any, any, any, any>,
    url: string, 
    cid?: ChannelId,
  }) {
    super({ spark, cid });
    this.url = url;
    this.sendRequest = this.sendRequest.bind(this);
  }

  protected async sendRequest(request) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const json = await response.json();
    if (!json.error) super.handleResponse(json);
  }

  static receive() {
    throw new Error("Fetch channels are outgoing only");
  }
}
