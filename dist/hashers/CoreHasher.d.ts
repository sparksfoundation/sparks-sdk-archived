import { HashDigest } from "./types";
export declare abstract class CoreHasher {
    constructor();
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    abstract hash(params?: Record<string, any>): Promise<HashDigest>;
}
