import { CoreChannel } from "../../CoreChannel";
import { CoreChannelActions, CoreChannelInterface } from "../../types";
import { HttpFetchParams } from "./types";

export class HttpFetch extends CoreChannel implements CoreChannelInterface<CoreChannelActions> {

  constructor({ peer, ...params }: HttpFetchParams) {
    const type = 'HttpFetch';
    super({ ...params, type, peer });
    this.peer.url = peer.url;
    this.peer.origin = peer?.origin ? peer.origin : new URL(peer.url).origin;
  }

  public async sendEvent(request) {
    const response = await fetch(this.peer.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const json = await response.json();
    if (!json.error) this.handleEvent(json);
  }

  static receive() {
    throw new Error("Fetch channels are outgoing only");
  }
}