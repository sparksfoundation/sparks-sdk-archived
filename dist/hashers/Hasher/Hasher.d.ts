import { Spark } from "../Spark";
import { IHasher } from "./types";
export declare class Hasher implements IHasher {
    protected spark: Spark;
    constructor(spark: any);
    hash(data: any): Promise<any>;
}
