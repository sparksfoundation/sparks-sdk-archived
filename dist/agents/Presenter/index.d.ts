import { S as SparkInterface } from '../../types-ea65808d.js';
import { S as SparkAgent } from '../../index-91aa2e5b.js';
import '../../types-188a9fde.js';
import '../../types-d4be7460.js';
import '../../types-93f6b970.js';

declare class Presenter extends SparkAgent {
    private _credentials;
    constructor(spark: SparkInterface<any, any, any, any, any>);
    get credentials(): Record<string, any>[];
    addCredential(credential: any): void;
    removeCredential(credential: any): void;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
}

export { Presenter };
