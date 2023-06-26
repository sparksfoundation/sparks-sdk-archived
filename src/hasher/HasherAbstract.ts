import { ErrorInterface } from "../common/errors";
import { HashDigest } from "./types";

// abstract class used by classes that use Hasher
export abstract class HasherAbstract {
  constructor() {
    this.hash = this.hash.bind(this);
  }
  public abstract hash(params?: Record<string, any>): Promise<HashDigest | ErrorInterface>;
}