import { CoreChannel } from "../CoreChannel";
export declare abstract class ChannelAction<Actions extends string[]> {
    protected channel: CoreChannel;
    abstract readonly name: string;
    readonly actions: Actions;
    setContext({ channel }: {
        channel: CoreChannel;
    }): void;
}
