import { SparkEvent } from "../../events/SparkEvent";
import { SparkChannel } from "../SparkChannel";
import { SparkChannelActions, SparkChannelInterface } from "../SparkChannel/types";
import { HttpFetchParams } from "./types";

export class HttpFetch extends SparkChannel implements SparkChannelInterface<SparkChannelActions> {

  constructor({ peer, ...params }: HttpFetchParams) {
    const type = 'HttpFetch';
    super({ ...params, type, peer });
    this.peer.url = peer.url;
    this.peer.origin = peer?.origin ? peer.origin : new URL(peer.url).origin;
  }

  public async sendEvent(payload: SparkEvent) {
    const response = await fetch(this.peer.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!json.error) this.handleEvent(json);
  }

  static receive() {
    throw new Error("Fetch channels are outgoing only");
  }
}