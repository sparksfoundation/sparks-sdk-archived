import { ISigner } from "./types.js";

// Mixin: Sign is an abstract class that provides signing and verification
export class Signer implements ISigner {
  protected spark: any; // TODO define spark interface

  constructor(spark: any) {
    this.spark = spark;
  }

  public async sign({ data, detached = false }) {
    throw new Error('sign not implemented');
    return ''
  }
  
  public async verify({ publicKey, signature, data }) {
    throw new Error('verify not implemented');
    return false as boolean;
  }
}
