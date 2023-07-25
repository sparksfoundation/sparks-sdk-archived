import EventEmitter from 'eventemitter3';
import { S as Spark, C as CamelCase } from './index-bc7739d8.js';
import { I as Identifier, P as PublicKeys } from './types-064649ae.js';

type RequestEventType = `${string}_REQUEST`;
type ConfirmEventType = `${string}_CONFIRM`;
type ErrorEventType = `${string}_ERROR`;
type EventId = string;
type EventType = RequestEventType | ConfirmEventType | ErrorEventType;
type SparkEventParams = {
    readonly type: EventType;
    readonly metadata: {
        eventId: EventId;
    } & Record<string, any>;
    readonly timestamp: number;
} & ({
    readonly data: Record<string, any>;
    readonly digest?: undefined;
} | {
    readonly digest: string;
    readonly data?: undefined;
});
interface SparkEventInterface {
    readonly type: EventType;
    readonly metadata: Record<string, any>;
    readonly timestamp: number;
    readonly data?: Record<string, any>;
    readonly digest?: string;
}

declare class SparkEvent implements SparkEventInterface {
    readonly type: RequestEventType | ConfirmEventType | ErrorEventType;
    readonly timestamp: number;
    readonly metadata: Record<string, any>;
    readonly data: Record<string, any>;
    readonly digest: string;
    constructor(args: SparkEventParams);
}
declare class SparkRequestEvent extends SparkEvent {
    readonly type: RequestEventType;
}
declare class SparkConfirmEvent extends SparkEvent {
    readonly type: ConfirmEventType;
}

type ChannelType = 'WebRTC' | 'HttpFetch' | 'HttpRest' | 'PostMessage';
type ChannelId = string;
type ChannelPeer = {
    identifier?: Identifier;
    publicKeys?: PublicKeys;
    [key: string]: any;
};
type ChannelState = {
    [key: string]: any;
};
type ChannelLoggedEvent = {
    event: SparkEvent;
    request?: boolean;
    response?: boolean;
};
interface ChannelExport {
    channelId: ChannelId;
    type: ChannelType;
    peer: ChannelPeer;
    eventLog: ChannelLoggedEvent[];
}
type SparkChannelActions = ['OPEN', 'CLOSE', 'MESSAGE'];
declare const SparkChannelActions: readonly ["OPEN", "CLOSE", "MESSAGE"];
type RequestMethod<Action extends string> = Uncapitalize<CamelCase<Action>>;
type OnRequestMethod<Action extends string> = `on${Capitalize<CamelCase<Action>>}Requested`;
type ConfirmMethod<Action extends string> = `confirm${Capitalize<CamelCase<Action>>}`;
type OnConfirmMethod<Action extends string> = `on${Capitalize<CamelCase<Action>>}Confirmed`;
type RequestParams = {
    metadata?: Record<string, any>;
    data?: Record<string, any>;
};
type RequestOptions = {
    timeout?: number;
    retries?: number;
};
type SparkChannelInterface<Actions extends string[]> = {
    readonly channelId: ChannelId;
    readonly type: ChannelType;
    readonly peer: ChannelPeer;
    readonly state: ChannelState;
    readonly eventLog: ChannelLoggedEvent[];
    readonly eventTypes: {
        [key: string]: EventType;
    };
    export(): ChannelExport;
    import(params: ChannelExport): void;
} & {
    [key in RequestMethod<Actions[number]>]: (params: RequestParams, options?: RequestOptions) => Promise<any>;
} & {
    [key in OnRequestMethod<Actions[number]>]: (event: SparkRequestEvent) => Promise<void>;
} & {
    [key in ConfirmMethod<Actions[number]>]: (event: SparkRequestEvent) => Promise<void>;
} & {
    [key in OnConfirmMethod<Actions[number]>]: (event: SparkConfirmEvent) => Promise<void>;
};
type SparkChannelParams = {
    spark: Spark<any, any, any, any, any>;
    channelId?: ChannelId;
    type?: ChannelType;
    peer?: ChannelPeer;
    state?: ChannelState;
    eventLog?: ChannelLoggedEvent[];
    actions?: string[];
};
type ChannelReceive = (callback: ({ event, confirmOpen, rejectOpen }: {
    event: SparkEvent;
    confirmOpen: () => Promise<SparkChannel>;
    rejectOpen: () => void;
}) => Promise<void>, options: {
    spark: Spark<any, any, any, any, any>;
    [key: string]: any;
}) => void;

declare abstract class SparkChannel extends EventEmitter implements SparkChannelInterface<SparkChannelActions> {
    protected _spark: Spark<any, any, any, any, any>;
    private _channelId;
    private _type;
    private _peer;
    private _state;
    private _eventLog;
    private _eventTypes;
    constructor(params: {
        type: ChannelType;
        spark: Spark<any, any, any, any, any>;
        channelId?: ChannelId;
        peer?: ChannelPeer;
        state?: ChannelState;
        eventLog?: ChannelLoggedEvent[];
        actions?: string[];
    });
    get channelId(): ChannelId;
    get type(): ChannelType;
    get peer(): ChannelPeer;
    get state(): ChannelState;
    get eventLog(): ChannelLoggedEvent[];
    get eventTypes(): {
        [key: string]: EventType;
    };
    private isValidEventPayload;
    private getRequestMethodName;
    private getConfirmMethodName;
    getEventData(event: SparkEvent, ourEvent?: boolean): Promise<any>;
    getReceiptData(event: SparkEvent): Promise<any>;
    protected dispatchRequest(event: SparkRequestEvent, { timeout, retries }?: {
        timeout?: number;
        retries?: number;
    }): Promise<SparkConfirmEvent>;
    protected abstract sendEvent(event: SparkEvent): Promise<void>;
    protected handleEvent(payload?: any): Promise<void>;
    import(params: ChannelExport): void;
    export(): ChannelExport;
    open(params?: RequestParams, options?: RequestOptions): Promise<this>;
    onOpenRequested(event: SparkRequestEvent): Promise<void>;
    confirmOpen(event: SparkRequestEvent): Promise<void>;
    onOpenConfirmed(event: SparkConfirmEvent): Promise<void>;
    close(params?: RequestParams, options?: RequestOptions): Promise<SparkConfirmEvent>;
    onCloseRequested(event: SparkRequestEvent): Promise<void>;
    confirmClose(event: SparkRequestEvent): Promise<void>;
    onCloseConfirmed(event: SparkConfirmEvent): Promise<void>;
    message(message: any, options?: RequestOptions): Promise<SparkConfirmEvent>;
    onMessageRequested(event: SparkRequestEvent): Promise<void>;
    confirmMessage(event: SparkRequestEvent): Promise<void>;
    onMessageConfirmed(event: SparkConfirmEvent): Promise<void>;
    emit<T extends string | symbol>(event: T, ...args: any[]): boolean;
    on<T extends string | symbol>(event: T | T[], listener: (...args: any[]) => void): this;
    once<T extends string | symbol>(event: T | T[], listener: (...args: any[]) => void): this;
    off<T extends string | symbol>(event: T | T[], listener: (...args: any[]) => void): this;
    removeListener<T extends string | symbol>(event: T, fn?: ((...args: any[]) => void) | undefined, context?: any, once?: boolean | undefined): this;
}

export { ChannelPeer as C, RequestParams as R, SparkChannelParams as S, SparkChannel as a, SparkChannelInterface as b, SparkChannelActions as c, SparkEvent as d, ChannelReceive as e, ChannelExport as f, ChannelType as g, SparkRequestEvent as h, RequestOptions as i, SparkConfirmEvent as j, ChannelState as k };
