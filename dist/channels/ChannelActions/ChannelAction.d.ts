import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { ChannelActionParams, ChannelActionRetries, ChannelActionTimeout } from "./types";
export declare abstract class ChannelAction<Actions extends string[]> {
    protected channel: CoreChannel;
    protected spark: Spark<any, any, any, any, any>;
    abstract readonly name: string;
    readonly actions: Actions;
    readonly retries: {
        [key in Actions[number]]: ChannelActionRetries;
    };
    readonly timeouts: {
        [key in Actions[number]]: ChannelActionTimeout;
    };
    constructor(params?: ChannelActionParams<Actions>);
    setContext({ spark, channel }: {
        spark: Spark<any, any, any, any, any>;
        channel: CoreChannel;
    }): void;
}
