import { Spark } from "../Spark";
import { ChannelErrorParams, ChannelErrorType } from "../errors/channel";
import { ChannelEmitter } from "./ChannelEmitter";
import { ChannelRequestEvent, ChannelEvent, ChannelConfirmEvent } from "./ChannelEvent";
import { ChannelEventData, ChannelEventParams, ChannelEventType } from "./ChannelEvent/types";
import { ChannelEventLog, ChannelExport, ChannelPeer, ChannelRequestParams, ChannelSettings, ChannelState, ChannelType, CoreChannelActions, CoreChannelInterface } from "./types";
import { SignerPublicKey } from "../signers/types";
import { EncryptedData } from "../ciphers/types";
export declare class CoreChannel extends ChannelEmitter implements CoreChannelInterface<CoreChannelActions> {
    private _spark;
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
    constructor(params: any);
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
    protected get spark(): Spark<any, any, any, any, any>;
    protected sendEvent(event: ChannelEvent): Promise<void>;
    protected handleEvent(params: ChannelEventParams | ChannelErrorParams): Promise<void>;
    openEventData(data: EncryptedData, signingKey?: SignerPublicKey): Promise<any>;
    protected sealEventData(data: ChannelEventData, signingKey?: SignerPublicKey): Promise<any>;
    protected dispatchRequest(request: ChannelRequestEvent, timeout?: number): Promise<ChannelConfirmEvent>;
    open(params?: ChannelRequestParams): Promise<CoreChannel>;
    onOpenRequested(request: ChannelRequestEvent): Promise<void>;
    confirmOpen(request: ChannelRequestEvent): Promise<void>;
    onOpenConfirmed(confirm: ChannelConfirmEvent): Promise<void>;
    close(params?: ChannelRequestParams): Promise<ChannelConfirmEvent>;
    onCloseRequested(request: ChannelRequestEvent): Promise<void>;
    confirmClose(request: ChannelRequestEvent): Promise<void>;
    onCloseConfirmed(confirm: ChannelConfirmEvent): Promise<void>;
    message(message: ChannelEventData | string, options?: ChannelRequestParams): Promise<ChannelConfirmEvent>;
    onMessageRequested(request: ChannelRequestEvent): Promise<void>;
    confirmMessage(request: ChannelRequestEvent): Promise<void>;
    onMessageConfirmed(confirm: ChannelConfirmEvent): Promise<void>;
    export(): ChannelExport;
    import(data: ChannelExport): Promise<void>;
    private logEvent;
    private getRequestHandlerName;
    private getConfirmHandlerName;
}
