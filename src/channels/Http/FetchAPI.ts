import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { ChannelEventLog, ChannelId, ChannelPeer, ChannelType } from "../types";

export class FetchAPI extends CoreChannel {
  private _url: string;
  private _origin: string;

  constructor({ spark, url, cid, eventLog, peer }: {
    spark: Spark<any, any, any, any, any>,
    url: string,
    cid?: ChannelId,
    origin?: string,
    eventLog?: ChannelEventLog,
    peer?: ChannelPeer,
  }) {
    super({ spark, cid, eventLog, peer });
    this._url = url;
    this._origin = origin || new URL(url).origin;
    this.sendRequest = this.sendRequest.bind(this);
  }

  public static type: ChannelType = ChannelType.FETCH_API_CHANNEL;
  public get url() { return this._url; }
  public get origin() { return this._origin; }

  protected async sendRequest(request) {
    const response = await fetch(this._url, {
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

  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    const url = this._url;
    const origin = this._origin;
    return Promise.resolve({ ...data, url, origin });
  }

  public async import(data) {
    await super.import(data);
    this._url = data.url;
    this._origin = data.origin;
  }
}
