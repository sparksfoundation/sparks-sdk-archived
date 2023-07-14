import { ChannelEmitter } from "./ChannelEmitter";
import { ChannelExport, ChannelPeer, ChannelId, ChannelLoggedEvent, CoreChannelParams, ChannelType } from "./types";
import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "./ChannelEvent";
import { ChannelError, ChannelErrorType } from "../errors/channel";
import { ChannelEventConfirmType, ChannelEventRequestType, ChannelEventType } from "./ChannelEvent/types";
import { ChannelAction } from "./ChannelActions";
import { Identifier } from "../controllers/types";
import { PublicKeys } from "../types";
import { CipherPublicKey, EncryptionSharedKey } from "../ciphers/types";
export declare class CoreChannel extends ChannelEmitter {
    static readonly timeout = 2000;
    private readonly timeout;
    readonly channelId: ChannelId;
    readonly eventLog: ChannelLoggedEvent[];
    readonly type: ChannelType;
    peer: ChannelPeer;
    private _spark;
    private _actions;
    private _errorTypes;
    private _eventTypes;
    constructor({ spark, actions, channelId, peer, eventLog, timeout }: CoreChannelParams);
    protected getAction(typeOrName: string): ChannelAction<any>;
    protected toConfirmType(eventType: ChannelEventRequestType): ChannelEventConfirmType;
    get eventTypes(): {
        [key: string]: ChannelEventRequestType | ChannelEventConfirmType | ChannelErrorType;
    };
    get errorTypes(): {
        [key: string]: ChannelErrorType;
    };
    get requestTypes(): {
        [key: string]: ChannelEventRequestType;
    };
    get confirmTypes(): {
        [key: string]: ChannelEventConfirmType;
    };
    export(): ChannelExport;
    private preflightChecks;
    requestPreflight(callback: (requestEvent: ChannelRequestEvent) => void): void;
    dispatchRequest(event: ChannelRequestEvent, attempt?: number): Promise<ChannelConfirmEvent>;
    protected handleResponse(event: ChannelEvent<ChannelEventType> | ChannelError): Promise<void>;
    sealEvent(event: ChannelEvent<ChannelEventType>): Promise<ChannelEvent<ChannelEventType>>;
    openEvent(event: ChannelEvent<ChannelEventType>): Promise<ChannelEvent<ChannelEventType>>;
    get identifier(): Identifier;
    get publicKeys(): PublicKeys;
    get sharedKey(): EncryptionSharedKey;
    setSharedKey(publicKey: CipherPublicKey): Promise<void>;
    protected sendRequest(event: ChannelEvent<ChannelEventType>): Promise<void>;
}
