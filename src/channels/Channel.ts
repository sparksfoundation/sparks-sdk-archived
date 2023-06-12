import { IChannel, IChannelManager } from "./types";

export class Channel implements IChannel {
    public cid: string;
    public target: any;
    public sharedKey: string;

    constructor() {
    }
    
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
    public channels: IChannel[] = [];

    public async open(): Promise<void> {
        return Promise.resolve();
    }

    public async close(): Promise<void> {
        return Promise.resolve();
    }
}