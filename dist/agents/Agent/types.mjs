import { Agent } from "./Agent.mjs";
export class AAgent {
  constructor(spark) {
    if (!spark)
      throw new Error("Channel: missing spark");
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
    if (!(this instanceof Agent)) {
      this.agent = new Agent(spark);
    }
  }
}
