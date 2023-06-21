import { ISpark } from "../../Spark";
import { ISigner } from "./types";
export declare class Signer implements ISigner {
    protected spark: ISpark<any, any, any, any, any>;
    constructor(spark: ISpark<any, any, any, any, any>);
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
