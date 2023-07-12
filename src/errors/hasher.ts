import { SparkError, SparkErrorParams } from "./SparkError";

export enum HasherErrorType {
  HASHING_ERROR = 'HASHING_ERROR',
}

export class HasherErrors {
  public static HashingFailure({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      type: HasherErrorType.HASHING_ERROR,
      message: `failed to hash data`,
      metadata: { ...metadata },
      stack
    });
  }
}