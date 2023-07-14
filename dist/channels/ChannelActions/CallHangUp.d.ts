import { CoreChannel } from "../CoreChannel";
import { ChannelAction } from "./ChannelAction";
import { ChannelActionRequest } from "./types";
type Actions = ['CALL', 'HANGUP'];
declare const Actions: readonly ["CALL", "HANGUP"];
export declare class CallHangUp extends ChannelAction<Actions> {
    readonly name = "CALL_HANGUP";
    readonly actions: Actions;
    setContext({ channel }: {
        channel: CoreChannel;
    }): void;
    CALL_REQUEST: ChannelActionRequest;
    CALL_CONFIRM: ChannelActionRequest;
    HANGUP_REQUEST: ChannelActionRequest;
    HANGUP_CONFIRM: ChannelActionRequest;
}
export {};
