import { ErrorInterface } from "../common/errors";
import { HashDigest } from "./types";

// abstract class used by classes that use Hasher
export abstract class HasherAbstract {
  constructor() {
    this.hash = this.hash.bind(this);
  }
  public abstract hash(...args: any): Promise<HashDigest | ErrorInterface>;
}