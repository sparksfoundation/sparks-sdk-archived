import { ChannelEvent } from "../../ChannelEvent";
import { CoreChannel } from "../../CoreChannel";
import { ChannelReceive, CoreChannelActions, CoreChannelInterface } from "../../types";
import { PostMessageExport, PostMessageParams } from "./types";
export declare class PostMessage extends CoreChannel implements CoreChannelInterface<CoreChannelActions> {
    constructor(params: PostMessageParams);
    open(): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    confirmOpen(request: any): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    close(): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    confirmClose(request: any): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    handleEvent(event: any): Promise<void>;
    sendEvent(event: ChannelEvent): Promise<void>;
    export(): PostMessageExport;
    import(data: PostMessageExport): Promise<void>;
    static receive: ChannelReceive;
}
