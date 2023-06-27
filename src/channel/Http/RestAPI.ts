import { Spark } from "../../Spark";
import { ChannelCore } from "../ChannelCore";
import { AnyChannelEvent, ChannelEventType, ChannelId, HandleOpenRequested } from "../types";

export class RestAPI extends ChannelCore {
    static promises: Map<string, any> = new Map();
    static receives: Map<string, any> = new Map();
    static requestHandler: Function;

    constructor({ spark, cid }: {
        spark: Spark<any, any, any, any, any>,
        cid?: ChannelId,
    }) {
        super({ spark, cid });
        this.sendRequest = this.sendRequest.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        super.handleResponse = this.handleResponse;
        RestAPI.receives.set(this.cid, this.handleResponse);
    }

    protected async handleResponse(response) {
        await super.handleResponse(response);
        const promise = RestAPI.promises.get(response.eid);
        if (!promise) return;
        promise.resolve();
        RestAPI.promises.delete(response.eid);
    }

    protected async sendRequest(request: AnyChannelEvent): Promise<void> {
        const promise = RestAPI.promises.get(request.metadata.eid);
        promise.resolve(request);
        RestAPI.promises.delete(request.metadata.eid);
    }

    public static handleOpenRequests(callback: HandleOpenRequested, { spark }: { spark: Spark<any, any, any, any, any> }) {
        if (!spark || !callback) {
            throw new Error('missing required arguments: spark, callback');
        }

        RestAPI.requestHandler = async (request) => {
            return new Promise((resolve, reject) => {
                const { type, metadata } = request;
                const { eid, cid } = metadata;
                if (!eid || !cid || !type) {
                    return reject({ error: 'Invalid request' });
                }

                RestAPI.promises.set(eid, { resolve, reject });
                const receive = RestAPI.receives.get(cid);
                if (receive) return receive(request);
                const isRequest = type === ChannelEventType.OPEN_REQUEST;
                if (!isRequest) return;

                const channel = new RestAPI({
                    spark,
                    cid,
                });

                channel.handleOpenRequested = callback;
                channel.handleResponse(request);

            })
        };

    }
}
