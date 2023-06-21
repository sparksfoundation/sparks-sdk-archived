import { ISpark } from "../../Spark";
import { AChannel } from "../Channel/types";
export declare class PostMessage extends AChannel {
    private source;
    private origin;
    private _window?;
    constructor({ _window, source, origin, spark, ...args }: {
        _window?: Window;
        source: Window;
        origin: string;
        spark: ISpark<any, any, any, any, any>;
        args?: any;
    });
    protected sendMessage(event: any): void;
    protected receiveMessage(payload: any): void;
    static receive(callback: ({ details, resolve, reject }: {
        details: any;
        resolve: any;
        reject: any;
    }) => void, { spark, _window }: {
        spark: ISpark<any, any, any, any, any>;
        _window?: Window;
    }): void;
}
