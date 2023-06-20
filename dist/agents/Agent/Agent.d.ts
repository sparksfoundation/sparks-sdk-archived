import { Spark } from '../../Spark';
import { IAgent } from './types';
export declare class Agent implements IAgent {
    protected spark: Spark;
    constructor(spark: Spark);
}
