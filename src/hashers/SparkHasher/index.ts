import { HashDigest, SparkHasherInterface } from "./types";

export abstract class SparkHasher implements SparkHasherInterface {
  public readonly algorithm: string;

  constructor({ algorithm }: { algorithm: string }) {
    this.algorithm = algorithm;
    this.hash = this.hash.bind(this);
  }
  
  public async import(data: Record<string, any>): Promise<void> {
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({});
  }

  public abstract hash(params?: Record<string, any>): HashDigest;
}