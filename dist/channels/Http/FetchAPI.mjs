import { AChannel } from "../Channel/index.mjs";
export class FetchAPI extends AChannel {
  constructor({
    spark,
    url
  }) {
    super({ spark });
    this.url = url;
    this.handleResponse = this.handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.channel.setRequestHandler(this.sendRequest);
  }
  handleResponse(response) {
    return this.channel.handleResponse(response);
  }
  async sendRequest(request) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    const json = await response.json();
    if (!json.error)
      this.handleResponse(json);
  }
  static receive() {
    throw new Error("Fetch channels are outgoing only");
  }
}
