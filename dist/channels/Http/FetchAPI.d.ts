import { Channel } from "../Channel/Channel";
export declare class FetchAPI extends Channel {
    private url;
    constructor({ url, ...args }: {
        url: string;
        args: any;
    });
    protected sendMessage(payload: any): Promise<void>;
    static receive(): Promise<void>;
}
