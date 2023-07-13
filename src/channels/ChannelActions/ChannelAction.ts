import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { ChannelActionParams, ChannelActionRetries, ChannelActionTimeout } from "./types";

export abstract class ChannelAction<Actions extends string[]> {
    protected channel: CoreChannel;
    public abstract readonly name: string;
    public readonly actions: Actions;

    public setContext({ channel }: { channel: CoreChannel }) {
        this.channel = channel;
    }
}