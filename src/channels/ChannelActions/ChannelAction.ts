import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { ChannelActionParams, ChannelActionRetries, ChannelActionTimeout } from "./types";

export abstract class ChannelAction<Actions extends string[]> {
    protected channel: CoreChannel;
    public abstract readonly name: string;
    public readonly actions = [] as Actions;
    public readonly retries: {
        [key in Actions[number]]: ChannelActionRetries;
    };
    public readonly timeouts: {
        [key in Actions[number]]: ChannelActionTimeout;
    };

    constructor(params?: ChannelActionParams<Actions>) {
        Object.entries(params || {}).forEach(([key, value]) => {
            if (key === 'retries') {
                Object.entries(value).forEach(([action, retries]: [string, number]) => {
                    this.retries[action] = retries || 0;
                });
            } else if (key === 'timeouts') {
                Object.entries(value).forEach(([action, timeout]: [string, number]) => {
                    this.timeouts[action] = timeout || 0;
                });
            }
        });
    }

    public setContext({ channel }: { channel: CoreChannel }) {
        this.channel = channel;
    }
}