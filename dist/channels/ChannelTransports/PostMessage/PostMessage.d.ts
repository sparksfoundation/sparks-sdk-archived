import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "../../ChannelEvent";
import { CoreChannel } from "../../CoreChannel";
import { ChannelReceive, ChannelRequestParams, CoreChannelActions, CoreChannelInterface } from "../../types";
import { PostMessageExport, PostMessageParams } from "./types";
export declare class PostMessage extends CoreChannel implements CoreChannelInterface<CoreChannelActions> {
    constructor(params: PostMessageParams);
    open(params?: ChannelRequestParams): Promise<CoreChannel>;
    onOpenRequested(request: ChannelRequestEvent): Promise<void>;
    confirmOpen(request: any): Promise<void>;
    close(params?: ChannelRequestParams): Promise<ChannelConfirmEvent>;
    onCloseConfirmed(confirm: ChannelConfirmEvent): Promise<void>;
    onCloseRequested(request: ChannelRequestEvent): Promise<void>;
    handleEvent(event: any): Promise<void>;
    sendEvent(event: ChannelEvent): Promise<void>;
    export(): PostMessageExport;
    import(data: PostMessageExport): Promise<void>;
    static receive: ChannelReceive;
}
