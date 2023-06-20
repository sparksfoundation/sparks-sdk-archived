export class Agent {
  // TODO define spark interface
  constructor(spark) {
    if (!spark)
      throw new Error("Channel: missing spark");
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
  }
}
