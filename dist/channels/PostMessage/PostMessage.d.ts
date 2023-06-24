import { ISpark } from "../../Spark";
import { AChannel, Channel } from "../Channel";
export declare class PostMessage extends AChannel {
    private source;
    private origin;
    private _window?;
    constructor({ _window, source, origin, spark, channel, }: {
        _window?: Window;
        source: Window;
        origin: string;
        spark: ISpark<any, any, any, any, any>;
        channel?: Channel;
    });
    protected handleResponse(event: any): Promise<unknown>;
    protected sendRequest(event: any): Promise<void>;
    static receive(callback: ({ details, resolve, reject }: {
        details: any;
        resolve: any;
        reject: any;
    }) => true | void, { spark, _window }: {
        spark: ISpark<any, any, any, any, any>;
        _window?: Window;
    }): void;
}
