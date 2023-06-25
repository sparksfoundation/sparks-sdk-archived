import { ErrorInterface } from '../errors/types';

// primitives
export type HashDigest = string;
export type HashData = string | Record<string, any>;

// abstract class used by classes that use Hasher
export abstract class HasherAbstract {
  public abstract hash(...args: any): Promise<HashDigest | ErrorInterface>;
}