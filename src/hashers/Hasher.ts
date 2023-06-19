import { Spark } from "../Spark";
import { IHasher } from "./types";

export class Hasher implements IHasher {
  protected spark: Spark;
  constructor(spark) {
    if (!spark) throw new Error('Channel: missing spark');
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
  }

  async hash(data) {
    return data;
  }
}