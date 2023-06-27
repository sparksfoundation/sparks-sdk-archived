import { SparkError, SparkErrorParams } from "./SparkError";

export enum HasherErrorName {
  HASHING_ERROR = 'HASHING_ERROR',
}

export class HasherErrors {
  public static HashingFailure({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: HasherErrorName.HASHING_ERROR,
      message: `failed to hash data${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }
}