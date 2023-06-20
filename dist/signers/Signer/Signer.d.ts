import { Spark } from "../../Spark";
import { ISigner } from "./types";
export declare class Signer implements ISigner {
    protected spark: Spark;
    constructor(spark: Spark);
    sign({ data, detached }: {
        data: any;
        detached?: boolean | undefined;
    }): Promise<string>;
    verify({ publicKey, signature, data }: {
        publicKey: string;
        signature: string;
        data?: string | object;
    }): Promise<boolean>;
}
