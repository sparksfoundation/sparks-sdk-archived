import { CoreController } from "../CoreController";
import { KeyPairs } from "../../types";
export declare class Basic extends CoreController {
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    private keyEvent;
    incept(): Promise<void>;
    rotate({ nextKeyPairs }: {
        nextKeyPairs: KeyPairs;
    }): Promise<void>;
    destroy(): Promise<void>;
}
