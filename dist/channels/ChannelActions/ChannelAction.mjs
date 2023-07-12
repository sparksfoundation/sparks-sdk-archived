export class ChannelAction {
  constructor(params) {
    this.actions = [];
    Object.entries(params || {}).forEach(([key, value]) => {
      if (key === "retries") {
        Object.entries(value).forEach(([action, retries]) => {
          this.retries[action] = retries || 0;
        });
      } else if (key === "timeouts") {
        Object.entries(value).forEach(([action, timeout]) => {
          this.timeouts[action] = timeout || 0;
        });
      }
    });
  }
  setContext({ spark, channel }) {
    this.spark = spark;
    this.channel = channel;
  }
}
