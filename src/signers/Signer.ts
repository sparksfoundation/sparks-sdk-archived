import { Spark } from "../Spark.js";
import { ISigner } from "./types.js";

// Mixin: Sign is an abstract class that provides signing and verification
export class Signer implements ISigner {
  protected spark: Spark;

  constructor(spark: Spark) {
    if (!spark) throw new Error('Channel: missing spark');
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
  }

  public async sign({ data, detached = false }) {
    throw new Error('sign not implemented');
    return ''
  }
  
  public async verify({ publicKey, signature, data }: { publicKey: string, signature: string, data?: string | object }) {
    throw new Error('verify not implemented');
    return false;
  }
}
