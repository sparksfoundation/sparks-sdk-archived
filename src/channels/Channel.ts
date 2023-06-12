import { ChannelCallbacks, CloseChannelArgs, IChannel, IChannelManager, OpenChannelArgs } from "./types";

export class Channel implements IChannel {
    public cid: string;
    public target: any;
    public sharedKey: string;
    public callbacks: ChannelCallbacks;

    public async open(): Promise<void> {
        return Promise.resolve();
    }

    public async close(): Promise<void> {
        return Promise.resolve();
    }

    public async send(): Promise<void> {
        return Promise.resolve();
    }
}

export class ChannelManager implements IChannelManager {
    protected spark: any;
    public channels: IChannel[] = [];

    constructor(spark) {
        this.spark = spark;
    }

    public async open(args: OpenChannelArgs): Promise<void> {
        return Promise.resolve();
    }

    public async close(args: CloseChannelArgs): Promise<void> {
        return Promise.resolve();
    }
}