import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { ChannelEventLog, ChannelId, ChannelType } from "../types";

export class FetchAPI extends CoreChannel {
  private _url: string;
  private _origin: string;

  constructor({ spark, url, cid, eventLog }: {
    spark: Spark<any, any, any, any, any>,
    url: string,
    cid?: ChannelId,
    eventLog?: ChannelEventLog
  }) {
    super({ spark, cid, eventLog });
    this._url = url;
    this._origin = new URL(url).origin;
    this.sendRequest = this.sendRequest.bind(this);
  }

  public get type() { return ChannelType.FETCH_API_CHANNEL; }
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

  public async import(data: Record<string, any>) {
    this._origin = data.origin;
    this._url = data.url;
    await super.import(data);
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    const url = this._url;
    const origin = this._origin;
    return Promise.resolve({ ...data, url, origin });
  }
}
