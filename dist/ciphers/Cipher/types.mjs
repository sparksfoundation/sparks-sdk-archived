import { Cipher } from "./Cipher.mjs";
export class ACipher {
  constructor(spark) {
    if (!spark)
      throw new Error("Hasher: missing spark");
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
    this.cipher = new Cipher(this.spark);
    this.encrypt = this.encrypt.bind(this);
    this.decrypt = this.decrypt.bind(this);
    this.computeSharedKey = this.computeSharedKey.bind(this);
  }
}
