export class Cipher {
  constructor(spark) {
    this.spark = spark;
    if (!this.spark)
      throw new Error("Channel: missing spark");
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
  }
  async encrypt(args) {
    throw new Error("Not implemented");
    return "";
  }
  async decrypt(args) {
    throw new Error("Not implemented");
    return null;
  }
  async computeSharedKey(args) {
    throw new Error("Not implemented");
    return "";
  }
}
