import { ErrorInterface } from './Error';
export type HashDigest = string;
export type HashData = string | Record<string, any>;
export declare abstract class HasherAbstract {
    abstract hash(...args: any): Promise<HashDigest | ErrorInterface>;
}
