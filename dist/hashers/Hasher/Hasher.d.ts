import { ISpark } from "../../Spark";
import { IHasher } from "./types";
export declare class Hasher implements IHasher {
    protected spark: ISpark<any, any, any, any, any>;
    constructor(spark: ISpark<any, any, any, any, any>);
    hash(data: any): Promise<any>;
}
