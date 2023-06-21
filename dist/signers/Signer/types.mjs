import { Signer } from "./Signer.mjs";
export class ASigner {
  constructor(spark) {
    if (!spark)
      throw new Error("Signer: missing spark");
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
    this.signer = new Signer(this.spark);
    this.sign = this.sign.bind(this);
    this.verify = this.verify.bind(this);
  }
}
