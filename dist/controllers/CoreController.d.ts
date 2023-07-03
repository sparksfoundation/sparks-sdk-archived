import { Identifier, KeyEventLog } from "./types";
import { Spark } from "../Spark";
export declare abstract class CoreController {
    protected _identifier: Identifier;
    protected _keyEventLog: KeyEventLog;
    protected _spark: Spark<any, any, any, any, any>;
    constructor(spark: any);
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    getIdentifier(): Identifier;
    getKeyEventLog(): KeyEventLog;
    abstract incept(params?: Record<string, any>): Promise<void>;
    abstract rotate(params?: Record<string, any>): Promise<void>;
    abstract destroy(params?: Record<string, any>): Promise<void>;
}
