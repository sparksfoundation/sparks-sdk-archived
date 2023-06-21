import { ISpark } from '../../Spark';
import { IAgent } from './types';
export declare class Agent implements IAgent {
    protected spark: ISpark<any, any, any, any, any>;
    constructor(spark: ISpark<any, any, any, any, any>);
}
