import { ISpark } from "../../Spark";
/**
 * Agent interface
 * Use this ONLY for your own Agent implementation to provide contract signatures
 * Do not use this anywhere else
 */
export interface IAgent {
}
/**
 * Agent abstract class
 * Only used by extending Agent to get/enforce base functionality
 * And to set the instance of the core Agent
 */
export declare abstract class AAgent {
    protected agent: IAgent;
    protected spark: ISpark<any, any, any, any, any>;
    constructor(spark: ISpark<any, any, any, any, any>);
}
