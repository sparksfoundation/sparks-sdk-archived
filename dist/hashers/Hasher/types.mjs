import { Hasher } from "./Hasher.mjs";
export class AHasher {
  constructor(spark) {
    if (!spark)
      throw new Error("Hasher: missing spark");
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
    this.hasher = new Hasher(this.spark);
  }
}
