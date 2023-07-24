type HashDigest = string;
type HashData = string | Record<string, any>;
interface SparkHasherInterface {
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    hash(params?: Record<string, any>): Promise<HashDigest>;
}

export { HashDigest as H, SparkHasherInterface as S, HashData as a };
