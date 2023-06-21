import { Spark } from "../../Spark";
import { Channel } from "../Channel/Channel";
export declare class PostMessage extends Channel {
    private source;
    private origin;
    private _window?;
    constructor({ _window, source, origin, spark, ...args }: {
        _window?: Window;
        source: Window;
        origin: string;
        spark: Spark;
        args?: any;
    });
    protected sendMessage(event: any): void;
    protected receiveMessage(payload: any): void;
    static receive(callback: ({ details, resolve, reject }: {
        details: any;
        resolve: any;
        reject: any;
    }) => void, { spark, _window }: {
        spark: Spark;
        _window?: Window;
    }): void;
}
