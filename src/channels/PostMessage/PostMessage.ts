import { Spark } from "../../Spark";
import { ChannelErrors } from "../../errors/channel";
import { CoreChannel } from "../CoreChannel";
import { AnyChannelEvent, ChannelEventLog, ChannelEventType, ChannelId, ChannelPeer, ChannelType, HandleOpenRequested } from "../types";

export class PostMessage extends CoreChannel {
    private _source: Window;
    private _origin: Window['origin'];
    private _window?: Window;

    constructor({ _window, cid, source, origin, spark, eventLog, peer }: {
        _window?: Window,
        cid?: ChannelId,
        source?: Window,
        origin: Window['origin'],
        spark: Spark<any, any, any, any, any>,
        eventLog?: ChannelEventLog,
        peer?: ChannelPeer
    }) {
        super({ cid, spark, eventLog, peer });

        this._window = _window || window || null;
        this._origin = origin;
        this._source = source;

        this.sendRequest = this.sendRequest.bind(this);
        this.handleResponse = this.handleResponse.bind(this);

        this._window.addEventListener('message', this.handleResponse);
        this._window.addEventListener('beforeunload', async () => {
            await this.close();
        });
    }

    public static type: ChannelType = ChannelType.POSTMESSAGE_CHANNEL;
    public get origin() { return this._origin; }
    public get source() { return this._source; }

    public async open() {
        this._source = this._source || this._window.open(this._origin, '_blank');
        if (!this._source) throw ChannelErrors.OpenRequestError();
        return super.open();
    }

    protected handleClosed(event) {
        this._window.removeEventListener('message', this.handleResponse);
        return super.handleClosed(event);
    }

    protected async handleResponse(event) {
        return super.handleResponse(event.data);
    }

    protected async sendRequest(event: AnyChannelEvent): Promise<void> {
        this._source.postMessage(event, this._origin);
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
            channel.handleResponse(event);
        });
    }

    public async export(): Promise<Record<string, any>> {
        const data = await super.export();
        const origin = this._origin
        return Promise.resolve({ ...data, origin });
    }

    public async import(data) {
        const { origin } = data;
        if (origin !== this._origin) throw new Error('origin mismatch');
        return super.import(data);
    }
}