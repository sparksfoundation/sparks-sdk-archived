import { S as SparkControllerInterface, I as Identifier, K as KeyEventLog, a as SparkInterface, b as KeyPairs } from '../../types-c76b4006.js';
import '../../types-d473a34c.js';
import '../../types-188a9fde.js';
import '../../types-40269ceb.js';
import '../../types-14ae8009.js';

declare abstract class SparkController implements SparkControllerInterface {
    protected _identifier: Identifier;
    protected _keyEventLog: KeyEventLog;
    protected _spark: SparkInterface<any, any, any, any, any>;
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
