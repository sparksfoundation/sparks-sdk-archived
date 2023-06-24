import { ISpark } from "../../Spark";
import { AChannel } from "../Channel";
export declare class FetchAPI extends AChannel {
    private url;
    constructor({ spark, url, }: {
        spark: ISpark<any, any, any, any, any>;
        url: string;
    });
    protected handleResponse(response: any): void;
    protected sendRequest(request: any): Promise<void>;
    static receive(): void;
}
