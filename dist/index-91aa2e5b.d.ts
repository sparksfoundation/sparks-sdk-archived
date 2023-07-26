import { a as SparkAgentInterface, S as SparkInterface } from './types-ea65808d.js';

declare abstract class SparkAgent implements SparkAgentInterface {
    protected _spark: SparkInterface<any, any, any, any, any>;
    constructor(spark: SparkInterface<any, any, any, any, any>);
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
}

export { SparkAgent as S };
