import { HashDigest, SparkHasherInterface } from "./types";

export abstract class SparkHasher implements SparkHasherInterface {
  constructor() {
    this.hash = this.hash.bind(this);
  }
  
  public async import(data: Record<string, any>): Promise<void> {
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({});
  }

  public abstract hash(params?: Record<string, any>): Promise<HashDigest>;
}