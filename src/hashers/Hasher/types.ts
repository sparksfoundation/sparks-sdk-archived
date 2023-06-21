import { ISpark } from "../../Spark";
import { Hasher } from "./Hasher";

/**
 * Hasher interface
 * responsible for hashing data
 * extend Hasher class to implement other hashing algorithms
 */
export interface IHasher {
  /**
   * Hashes object or string 
   * @param {string} data - data to hash (object will be stringified)
   * @returns {Promise<string> | never} A promise that resolves to the base64 encoded string.
   * or rejects with an error.
   */
  hash: (data: any) => Promise<string> | never;
}

export abstract class AHasher {
  protected spark: ISpark<any, any, any, any, any>;
  protected hasher: IHasher;

  constructor(spark: ISpark<any, any, any, any, any>) {
    if (!spark) throw new Error('Hasher: missing spark');
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
    this.hasher = new Hasher(this.spark);
  }

  abstract hash(data: any): Promise<string> | never;
}
