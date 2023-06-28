import { HashDigest } from "./types";

// abstract class used by classes that use Hasher
export abstract class HasherCore {
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