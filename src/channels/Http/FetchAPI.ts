import { ISpark } from "../../Spark";
import { AChannel } from "../Channel";

export class FetchAPI extends AChannel {
  private url: string;

  constructor({ 
    spark, 
    url,
  }: { 
    spark: ISpark<any, any, any, any, any>, 
    url: string, 
  }) {
    super({ spark });
    this.url = url;
    this.handleResponse = this.handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.channel.setSendRequest(this.sendRequest);
  }

  protected handleResponse(response: any) {
    return this.channel.handleResponse(response);
  }

  protected async sendRequest(request) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const json = await response.json();
    if (!json.error) this.handleResponse(json);
  }

  static receive() {
    throw new Error("Fetch channels are outgoing only");
  }
}
