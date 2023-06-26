import { ErrorMessage, SparkError } from "../common/errors";
import { HasherErrorType, HasherType } from "./types";

export class HasherErrorFactory {
  private hasher: HasherType;
  constructor(hasher) {
    this.hasher = hasher;
  }

  public HashingFailure(reason?: ErrorMessage) {
    return new SparkError({
      type: HasherErrorType.HASHING_ERROR,
      message: `failed to hash data${reason ? `: ${reason}` : ''}`,
      metadata: { hasher: this.hasher }
    });
  }
}