import { Spark } from "../Spark";
import { EncryptionSharedKey } from "../ciphers/types";
import { Identifier } from "../controllers/types";
import { PublicKeys } from "../types";
import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "./ChannelEvent";
import { ChannelEventInterface, ChannelEventParams } from "./ChannelEvent/types";
import { CoreChannel } from "./CoreChannel";
export type ChannelTimeout = number;
export type ChannelId = string;
export type ChannelType = 'WebRTC' | 'PostMessage' | 'HttpFetch' | 'HttpRest';
export type ChannelState = Record<string, any>;
export type ChannelSettings = Record<string, any> & {
    readonly timeout?: ChannelTimeout;
};
export type ChannelPeer = Partial<{
    identifier: Identifier;
    publicKeys: PublicKeys;
    sharedKey: EncryptionSharedKey;
}> & Record<string, any>;
export type ChannelEventErrorType<A extends string> = `${A}_ERROR`;
export type ChannelLoggedEvent = ChannelEventInterface & {
    response: true;
    request?: false;
} | ChannelEventInterface & {
    response?: false;
    request: true;
};
export type ChannelEventLog = ChannelLoggedEvent[];
type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}` ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}` : Lowercase<S>;
type RequestMethod<Action extends string> = Uncapitalize<CamelCase<Action>>;
type ConfirmMethod<Action extends string> = `confirm${Capitalize<CamelCase<Action>>}`;
export type CoreChannelInterface<Actions extends string[]> = {
    channelId: ChannelId;
    type: ChannelType;
    peer: ChannelPeer;
    state: ChannelState;
    settings: ChannelSettings;
    eventLog: ChannelEventLog;
    handleEvent(data?: any): Promise<void>;
    sendEvent(event: ChannelEvent): Promise<void>;
    export(): ChannelExport;
    import(params: ChannelExport): void;
} & {
    [key in RequestMethod<Actions[number]>]: (params?: Partial<ChannelEventParams>) => Promise<ChannelConfirmEvent>;
} & {
    [key in ConfirmMethod<Actions[number]>]: (request: ChannelRequestEvent) => Promise<ChannelConfirmEvent>;
};
export type CoreChannelParams = {
    spark: Spark<any, any, any, any, any>;
    channelId?: ChannelId;
    type?: ChannelType;
    peer?: ChannelPeer;
    state?: ChannelState;
    settings?: ChannelSettings;
    actions?: string[];
    eventLog?: ChannelLoggedEvent[];
};
export type CoreChannelActions = ['OPEN', 'CLOSE', 'MESSAGE'];
export declare const CoreChannelActions: readonly ["OPEN", "CLOSE", "MESSAGE"];
export type ChannelReceive = (callback: ({ event, confirmOpen }: {
    event: ChannelEvent;
    confirmOpen: () => Promise<CoreChannel>;
}) => Promise<void>, options: {
    spark: Spark<any, any, any, any, any>;
    [key: string]: any;
}) => void;
export interface ChannelExport {
    channelId: ChannelId;
    type: ChannelType;
    peer: ChannelPeer;
    settings: ChannelSettings;
    eventLog: ChannelLoggedEvent[];
}
export {};