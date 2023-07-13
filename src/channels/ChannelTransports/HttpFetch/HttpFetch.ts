import { CoreChannel } from "../../CoreChannel";
import { CoreChannelParams, ChannelPeer } from "../../types";
import { OpenClose, Message } from "../../ChannelActions";

export type HttpFetchPeer = ChannelPeer & {
    url: Window['location']['href'],
    origin: Window['origin'],
}

export type HttpFetchParams = CoreChannelParams & {
    peer: HttpFetchPeer,
}

export class HttpFetch extends CoreChannel {
    public readonly type = 'HttpFetch';

    constructor({ peer, ...params }: HttpFetchParams) {
        super({ ...params, peer, actions: [  new OpenClose(), new Message() ] });
        this.peer.url = peer?.url;
        this.peer.origin = peer?.origin ? peer.origin : new URL(peer.url).origin;
        this.sendRequest = this.sendRequest.bind(this);
    }

    public async open() {
        const action = this.getAction('OPEN_CLOSE') as OpenClose;
        const confirmation = await action.OPEN_REQUEST();
        return confirmation;
    }

    public message(message) {
        const action = this.getAction('MESSAGE') as Message;
        return action.MESSAGE_REQUEST({ data: message });
    }

    protected async sendRequest(request) {
        const response = await fetch(this.peer.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });
        const json = await response.json();
        if (!json.error) super.handleResponse(json);
    }

    static receive() {
        throw new Error("Fetch channels are outgoing only");
    }
}