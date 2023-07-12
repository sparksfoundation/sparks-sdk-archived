import { CoreChannel } from "../CoreChannel";
import { CoreChannelParams, ChannelPeer, ChannelSendRequest, ChannelReceive } from "../types";
import { OpenClose, Message } from "../ChannelActions";
import { ChannelRequestEvent } from "../ChannelEvent";

export type HttpRestPeer = ChannelPeer & {
    origin: Window['origin'],
}

export class HttpRest extends CoreChannel {
    private static promises: Map<string, any> = new Map();
    private static receives: Map<string, any> = new Map();
    public static requestHandler: Function;

    constructor({ peer, ...params }: CoreChannelParams & {
        peer: HttpRestPeer,
    }) {
        super({ ...params, peer, actions: [new OpenClose(), new Message()] });
        this.sendRequest = this.sendRequest.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        HttpRest.receives.set(this.channelId, this.handleResponse);
    }

    protected async handleResponse(response) {
        await super.handleResponse(response);
        const promise = HttpRest.promises.get(response.eventId);
        if (!promise) return;
        promise.resolve();
        HttpRest.promises.delete(response.eventId);
    }

    protected open(event) {
        const action = this.getAction('OPEN_CLOSE') as OpenClose;
        return action.OPEN_REQUEST(event);
    }

    protected async sendRequest(request: ChannelRequestEvent<any>): Promise<void> {
        const promise = HttpRest.promises.get(request.metadata.eventId);
        promise.resolve(request);
        HttpRest.promises.delete(request.metadata.eventId);
    }

    public static receive: ChannelReceive = (callback, options) => {
        const { spark } = options;

        HttpRest.requestHandler = async (event: ChannelRequestEvent<false>) => {
            return new Promise((resolve, reject) => {
                const { type, data, metadata } = event;
                const { eventId, channelId } = metadata;
                if (!eventId || !channelId || !type) {
                    return reject({ error: 'Invalid request' });
                }

                HttpRest.promises.set(eventId, { resolve, reject });
                
                const receivePromise = HttpRest.receives.get(channelId);
                if (receivePromise) return receivePromise(event);

                const isRequest = type === 'OPEN_REQUEST';
                if (!isRequest) return;

                const confirmOpen = () => {
                    return new Promise<HttpRest>(async (resolve, reject) => {
                        const channel = new HttpRest({
                            peer: { ...data.peer },
                            spark: spark,
                            channelId: metadata.channelId,
                        });

                        await channel.open(event);
                        await channel.handleResponse(event);
                        return resolve(channel);
                    });
                }

                return callback({ event, confirmOpen });
            });
        };
    }
}