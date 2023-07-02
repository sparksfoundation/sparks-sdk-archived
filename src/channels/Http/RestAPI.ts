import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { AnyChannelEvent, ChannelEventLog, ChannelEventType, ChannelId, ChannelPeer, ChannelType, HandleOpenRequested } from "../types";

export class RestAPI extends CoreChannel {
    private static promises: Map<string, any> = new Map();
    private static receives: Map<string, any> = new Map();
    public static requestHandler: Function;

    constructor({ spark, cid, eventLog, peer }: {
        spark: Spark<any, any, any, any, any>,
        cid?: ChannelId,
        eventLog?: ChannelEventLog,
        peer?: ChannelPeer
    }) {
        super({ spark, cid, eventLog, peer });
        this.sendRequest = this.sendRequest.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        RestAPI.receives.set(this.cid, this.handleResponse);
    }

    public static type: ChannelType = ChannelType.REST_API_CHANNEL;

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
