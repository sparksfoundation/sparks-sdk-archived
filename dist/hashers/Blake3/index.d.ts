import { S as SparkHasherInterface, H as HashDigest, a as HashData } from '../../types-d4be7460.js';

declare abstract class SparkHasher implements SparkHasherInterface {
    readonly algorithm: string;
    constructor({ algorithm }: {
        algorithm: string;
    });
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    abstract hash(params?: Record<string, any>): HashDigest;
}

declare class Blake3 extends SparkHasher {
    constructor();
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    hash({ data }: {
        data: HashData;
    }): ReturnType<SparkHasher['hash']>;
}

export { Blake3 };
