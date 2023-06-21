import { ISpark } from "../../Spark";
import { IHasher } from "./types";

export class Hasher implements IHasher {
  protected spark: ISpark<any, any, any, any, any>;
  constructor(spark: ISpark<any, any, any, any, any>) {
    if (!spark) throw new Error('Hasher: missing spark');
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
  }
  async hash(data) {
    return data;
  }
}