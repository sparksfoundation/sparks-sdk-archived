import { b as SparkControllerInterface, S as SparkInterface, I as Identifier, K as KeyEventLog, c as KeyPairs } from '../../types-ea65808d.js';
import '../../types-188a9fde.js';
import '../../types-d4be7460.js';
import '../../types-93f6b970.js';

declare abstract class SparkController implements SparkControllerInterface {
    protected _spark: SparkInterface<any, any, any, any, any>;
    protected _identifier: Identifier;
    protected _keyEventLog: KeyEventLog;
    constructor(spark: SparkInterface<any, any, any, any, any>);
    get identifier(): Identifier;
    get keyEventLog(): KeyEventLog;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    abstract incept(params?: Record<string, any>): Promise<void>;
    abstract rotate(params?: Record<string, any>): Promise<void>;
    abstract destroy(params?: Record<string, any>): Promise<void>;
}

declare class Basic extends SparkController {
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    private keyEvent;
    incept(): Promise<void>;
    rotate({ nextKeyPairs }: {
        nextKeyPairs: KeyPairs;
    }): Promise<void>;
    destroy(): Promise<void>;
}

export { Basic };
