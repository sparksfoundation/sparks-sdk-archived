import { S as SparkHasherInterface, H as HashDigest, a as HashData } from '../../types-40269ceb.js';

declare abstract class SparkHasher implements SparkHasherInterface {
    constructor();
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    abstract hash(params?: Record<string, any>): Promise<HashDigest>;
}

declare class Blake3 extends SparkHasher {
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    hash({ data }: {
        data: HashData;
    }): ReturnType<SparkHasher['hash']>;
}

export { Blake3 };
