import { SparkError, SparkErrorParams } from "./SparkError";

export enum HasherErrorName {
  HASHING_ERROR = 'HASHING_ERROR',
}

export class HasherErrors {
  public static HashingFailure({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: HasherErrorName.HASHING_ERROR,
      message: `failed to hash data`,
      metadata: { ...metadata },
      stack
    });
  }
}