import { ChannelActionConfirm, ChannelActionRequest } from "./types";
import { Spark } from "../../Spark";
import { CoreChannel } from "../CoreChannel";
import { ChannelAction } from "./ChannelAction";
type Actions = ['OPEN', 'CLOSE'];
declare const Actions: readonly ["OPEN", "CLOSE"];
export declare class OpenClose extends ChannelAction<Actions> {
    readonly name = "OPEN_CLOSE";
    readonly actions: Actions;
    status: 'OPEN' | 'CLOSED';
    setContext({ spark, channel }: {
        spark: Spark<any, any, any, any, any>;
        channel: CoreChannel;
    }): void;
    OPEN_REQUEST: ChannelActionRequest;
    OPEN_CONFIRM: ChannelActionConfirm;
    CLOSE_REQUEST: ChannelActionRequest;
    CLOSE_CONFIRM: ChannelActionConfirm;
}
export {};
