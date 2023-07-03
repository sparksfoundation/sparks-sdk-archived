import { HashData } from "../types";
import { CoreHasher } from "../CoreHasher";
export declare class Blake3 extends CoreHasher {
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    hash({ data }: {
        data: HashData;
    }): ReturnType<CoreHasher['hash']>;
}
