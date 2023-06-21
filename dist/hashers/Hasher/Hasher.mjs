export class Hasher {
  constructor(spark) {
    if (!spark)
      throw new Error("Hasher: missing spark");
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
  }
  async hash(data) {
    return data;
  }
}
