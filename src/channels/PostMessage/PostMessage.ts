import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { AnyChannelEvent, ChannelEventType, ChannelId, HandleOpenRequested } from "../types";

export class PostMessage extends CoreChannel {
    private source: Window;
    private origin: Window['origin'];
    private _window?: Window;

    constructor({ _window, cid, source, origin, spark }: {
        _window?: Window,
        cid?: ChannelId,
        source: Window,
        origin: Window['origin'],
        spark: Spark<any, any, any, any, any>,
    }) {
        super({ cid, spark });

        this._window = _window || window || null;
        if (!this._window) throw new Error('PostMessage: missing window');

        this.origin = origin;
        this.source = source;

        this.sendRequest = this.sendRequest.bind(this);
        this._window.addEventListener('message', (event) => {
            super.handleResponse(event.data);
        });
    }

    protected async sendRequest(event: AnyChannelEvent): Promise<void> {
        this.source.postMessage(event, this.origin);
        return Promise.resolve();
    }

    public static handleOpenRequests(callback: HandleOpenRequested, { spark, _window }: { spark: Spark<any, any, any, any, any>, _window?: Window }) {
        const win = _window || window;
        if (!win || !spark || !callback) {
            throw new Error('missing required arguments: spark, callback');
        }

        win.addEventListener('message', async (event) => {
            const { type, cid } = event.data;
            const isRequest = type === ChannelEventType.OPEN_REQUEST;
            if (!isRequest) return;
            const channel = new PostMessage({
                _window: win,
                cid,
                source: event.source as Window,
                origin: event.origin,
                spark,
            });
            channel.handleOpenRequested = callback;
            channel.handleResponse(event.data);
        });
    }
}