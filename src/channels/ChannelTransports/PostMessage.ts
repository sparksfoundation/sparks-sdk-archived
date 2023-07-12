import { CoreChannel } from "../CoreChannel";
import { CoreChannelParams, ChannelPeer, ChannelSendRequest, ChannelReceive } from "../types";
import { OpenClose, Message } from "../ChannelActions";
import { ChannelRequestEvent } from "../ChannelEvent";

export type PostMessagePeer = ChannelPeer & {
    origin: Window['origin'],
}

export class PostMessage extends CoreChannel {
    private _source: Window;
    private _window?: Window;

    constructor({ _window, source, peer, ...params }: CoreChannelParams & {
        _window?: Window,
        source?: Window,
        peer: PostMessagePeer,
    }) {

        const openClose = new OpenClose();
        const message = new Message();
        super({ ...params, peer, actions: [ openClose, message ] });

        this.peer.origin = peer?.origin;
        this._window = _window || window || null;
        this._source = source;

        this.open = this.open.bind(this);
        this._window.addEventListener('message', event => {
            this.handleResponse(event.data);
        });
    }

    public async open() {
        this._source = this._source || this._window.open(this.peer.origin, '_blank');
        const action = this.getAction('OPEN_CLOSE') as OpenClose;

        const confirmation = await action.OPEN_REQUEST({
            data: { peer: { origin: this._window.origin } }
        });

        return confirmation;
    }

    public close() {
        const action = this.getAction('OPEN_CLOSE') as OpenClose;
        return action.CLOSE_REQUEST();
    }

    public message(message) {
        const action = this.getAction('MESSAGE') as Message;
        return action.MESSAGE_REQUEST({ data: message });
    }

    protected sendRequest: ChannelSendRequest = (event) => {
        this._source.postMessage(event, this.peer.origin);
        return Promise.resolve();
    }

    public static receive: ChannelReceive = (callback, options) => {
        const { _window, _source, spark } = options;
        _window.addEventListener('message', async (event) => {
            const { source, origin } = event;
            const { type, data, metadata, _source } = event.data;
            if (type !== 'OPEN_REQUEST') return;

            const confirmOpen = () => {
                return new Promise<PostMessage>(async (resolve, reject) => {
                    const channel = new PostMessage({
                        _window,
                        peer: { ...data.peer },
                        source: _source || source,
                        spark: spark,
                        channelId: metadata.channelId,
                    });

                    channel.on(channel.eventTypes.ANY_EVENT, async (event) => {
                        //console.log('receivor', event.type);
                    });

                    channel.on(channel.eventTypes.ANY_ERROR, async (event) => {
                        //console.log('receive error', event);
                    });

                    await channel.open();
                    await channel.handleResponse(event.data);

                    return resolve(channel);
                });
            }

            return callback({ event: event.data, confirmOpen });
        });
    }
}