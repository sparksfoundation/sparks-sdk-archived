import { ISpark } from '../../Spark';
import { Channel, AChannel } from '../Channel';
export declare class RestAPI extends AChannel {
    static promises: Map<string, any>;
    static receives: Map<string, any>;
    static requestHandler: Function;
    constructor({ spark, channel }: {
        spark: ISpark<any, any, any, any, any>;
        channel: Channel;
    });
    protected handleResponse(response: any): Promise<void>;
    protected handleRequest(request: any): Promise<void>;
    static receive(callback: any, { spark }: {
        spark: ISpark<any, any, any, any, any>;
    }): void;
}
