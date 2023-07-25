import { S as SparkAgentInterface, a as SparkInterface } from './types-064649ae.js';

declare abstract class SparkAgent implements SparkAgentInterface {
    protected _spark: SparkInterface<any, any, any, any, any>;
    constructor(spark: SparkInterface<any, any, any, any, any>);
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
}

export { SparkAgent as S };
