import { CoreChannel } from "../CoreChannel";
import { ChannelActionParams, ChannelActionRetries, ChannelActionTimeout } from "./types";
export declare abstract class ChannelAction<Actions extends string[]> {
    protected channel: CoreChannel;
    abstract readonly name: string;
    readonly actions: Actions;
    readonly retries: {
        [key in Actions[number]]: ChannelActionRetries;
    };
    readonly timeouts: {
        [key in Actions[number]]: ChannelActionTimeout;
    };
    constructor(params?: ChannelActionParams<Actions>);
    setContext({ channel }: {
        channel: CoreChannel;
    }): void;
}
