import { ChannelActionConfirm, ChannelActionRequest } from "./types";
import { CoreChannel } from "../CoreChannel";
import { ChannelAction } from "./ChannelAction";
type Actions = ['MESSAGE'];
declare const Actions: readonly ["MESSAGE"];
export declare class Message extends ChannelAction<Actions> {
    readonly name = "MESSAGE";
    readonly actions: Actions;
    setContext({ channel }: {
        channel: CoreChannel;
    }): void;
    MESSAGE_REQUEST: ChannelActionRequest;
    MESSAGE_CONFIRM: ChannelActionConfirm;
}
export {};
