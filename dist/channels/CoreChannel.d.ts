import { ChannelEmitter } from "./ChannelEmitter";
import { ChannelExport, ChannelPeer, ChannelId, ChannelLoggedEvent, CoreChannelParams } from "./types";
import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "./ChannelEvent";
import { ChannelError, ChannelErrorType } from "../errors/channel";
import { ChannelEventConfirmType, ChannelEventRequestType, ChannelEventType } from "./ChannelEvent/types";
import { ChannelAction } from "./ChannelActions";
export declare class CoreChannel extends ChannelEmitter {
    readonly channelId: ChannelId;
    readonly eventLog: ChannelLoggedEvent[];
    peer: ChannelPeer;
    private _actions;
    private _eventTypes;
    constructor({ spark, actions, channelId, peer }: CoreChannelParams);
    protected getAction(typeOrName: string): ChannelAction<any>;
    protected toConfirmType(eventType: ChannelEventRequestType): ChannelEventConfirmType;
    get eventTypes(): {
        [key: string]: ChannelEventRequestType | ChannelEventConfirmType | ChannelErrorType;
    };
    export(): ChannelExport;
    private preflightChecks;
    requestPreflight(callback: (requestEvent: ChannelRequestEvent<boolean>) => void): void;
    dispatchRequest(event: ChannelRequestEvent<boolean>, attempt?: number): Promise<ChannelConfirmEvent<boolean>>;
    protected handleResponse(event: ChannelEvent<ChannelEventType, boolean> | ChannelError): Promise<void>;
    protected sendRequest(event: ChannelEvent<ChannelEventType, boolean>): Promise<void>;
}
