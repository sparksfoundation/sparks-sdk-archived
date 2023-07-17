import { Spark } from "../Spark";
import { ChannelErrorParams, ChannelErrorType } from "../errors/channel";
import { ChannelEmitter } from "./ChannelEmitter";
import { ChannelRequestEvent, ChannelEvent, ChannelConfirmEvent } from "./ChannelEvent";
import { ChannelEventData, ChannelEventParams, ChannelEventType } from "./ChannelEvent/types";
import { ChannelEventLog, ChannelExport, ChannelPeer, ChannelSettings, ChannelState, ChannelType, CoreChannelActions, CoreChannelInterface, CoreChannelParams } from "./types";
export declare class CoreChannel extends ChannelEmitter implements CoreChannelInterface<CoreChannelActions> {
    private _channelId;
    private _type;
    private _peer;
    private _state;
    private _settings;
    private _eventLog;
    private _eventTypes;
    private _requestTypes;
    private _confirmTypes;
    private _errorTypes;
    private _spark;
    constructor(params: CoreChannelParams);
    protected get spark(): Spark<any, any, any, any, any>;
    get channelId(): string;
    get type(): ChannelType;
    get peer(): ChannelPeer;
    get state(): ChannelState;
    get settings(): ChannelSettings;
    get eventLog(): ChannelEventLog;
    get eventTypes(): {
        [key: string]: ChannelEventType<string>;
    };
    get requestTypes(): {
        [key: string]: `${string}_REQUEST`;
    };
    get confirmTypes(): {
        [key: string]: `${string}_CONFIRM`;
    };
    get errorTypes(): {
        [key: string]: ChannelErrorType;
    };
    private logEvent;
    private requestMethodName;
    private confirmMethodName;
    private confirmTypeFromType;
    protected dispatchRequest(request: ChannelRequestEvent): Promise<ChannelConfirmEvent>;
    handleEvent(params: ChannelEventParams | ChannelErrorParams): Promise<void>;
    sendEvent(event: ChannelEvent): Promise<void>;
    open(params?: Partial<ChannelEventParams>): Promise<ChannelConfirmEvent>;
    confirmOpen(request: ChannelRequestEvent): Promise<ChannelConfirmEvent>;
    close(params?: Partial<ChannelEventParams>): Promise<ChannelConfirmEvent>;
    confirmClose(request: ChannelRequestEvent): Promise<ChannelConfirmEvent>;
    message(message: any): Promise<ChannelConfirmEvent>;
    confirmMessage(request: ChannelRequestEvent): Promise<ChannelConfirmEvent>;
    getEventData(event: ChannelEvent): Promise<ChannelEventData>;
    export(): ChannelExport;
    import(data: ChannelExport): Promise<void>;
}
