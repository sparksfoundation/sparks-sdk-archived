import { 
    IChannelFactory, 
    IChannel, 
    CreateChannelArgs, 
    ChannelPublicEvents, 
    ChannelEventCallback, 
    ChannelOpenedReceipt, 
    ChannelClosedReceipt, 
    MessageSentReceipt, 
    SendMessageArgs, 
    ChannelPrivateEvents
} from "./types.js";
import { randomNonce } from "../utilities/index.js";


export class Channel implements IChannel {
    public cid: string;
    public target: any;
    protected spark: any;
    public sharedKey: string;

    constructor({ spark, target }) {
        this.cid = randomNonce(16);
        this.target = target;
        this.spark = spark;
    }

    public async open(): Promise<ChannelOpenedReceipt | void> {
        throw new Error('Not implemented');
        return Promise.resolve();
    }

    public async close(): Promise<ChannelClosedReceipt | void> {
        throw new Error('Not implemented');
        return Promise.resolve();
    }

    public async send(args: SendMessageArgs): Promise<MessageSentReceipt | void> {
        throw new Error('Not implemented');
        return Promise.resolve();
    }

    public on(event: ChannelPublicEvents, callback: ChannelEventCallback): void {
        throw new Error('Not implemented');
        return;
    }

    public confirm(event: ChannelPrivateEvents, args: any): void {}

    public reject(event: ChannelPrivateEvents, args: any): void {}
}

export class ChannelFactory implements IChannelFactory {
    protected spark: any;
    constructor(spark) {
        this.spark = spark;
        // handle private events here
    }

    public create(args: CreateChannelArgs): IChannel | never {
        throw new Error('Not implemented');
        return new Channel({} as any);
    }
}