import { ErrorInterface } from '../common/errors';

// primitives
export type HashDigest = string;
export type HashData = string | Record<string, any>;

export enum HasherErrorType {
  HASHING_ERROR = 'HASHING_ERROR',
}

export enum HasherType {
  BLAKE_3 = 'BLAKE_3',
}

// abstract class used by classes that use Hasher
export abstract class HasherAbstract {
  public abstract hash(...args: any): Promise<HashDigest | ErrorInterface>;
}