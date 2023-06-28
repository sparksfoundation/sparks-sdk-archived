import { HashDigest } from "./types";

// abstract class used by classes that use Hasher
export abstract class HasherCore {
  constructor() {
    this.hash = this.hash.bind(this);
  }
  public abstract hash(params?: Record<string, any>): Promise<HashDigest>;
}