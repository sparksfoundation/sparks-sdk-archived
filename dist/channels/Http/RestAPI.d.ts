import { Channel } from '../Channel/Channel';
export declare class RestAPI extends Channel {
    static promises: Map<string, any>;
    static receives: Map<string, any>;
    static eventHandler: Function;
    constructor({ ...args }: any);
    protected sendMessage(payload: any): Promise<void>;
    static receive(callback: any, { spark }: {
        spark: any;
    }): void;
}
