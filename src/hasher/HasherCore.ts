import { ErrorInterface } from "../common/errors";
import { HashDigest, HasherType } from "./types";
import { HasherErrorFactory } from "./errorFactory";
const errors = new HasherErrorFactory(HasherType.HASHER_CORE);

// abstract class used by classes that use Hasher
export abstract class HasherCore {
  constructor() {
    this.hash = this.hash.bind(this);
  }
  public abstract hash(params?: Record<string, any>): Promise<HashDigest | ErrorInterface>;
}