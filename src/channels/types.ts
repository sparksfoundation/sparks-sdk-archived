import { Spark } from "../Spark";
import { EncryptionSharedKey } from "../ciphers/types";
import { Identifier } from "../controllers/types";
import { PublicKeys } from "../types";
import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "./ChannelEvent";
import { ChannelEventInterface, ChannelEventParams } from "./ChannelEvent/types";
import { CoreChannel } from "./CoreChannel";

export type ChannelId = string;
export type ChannelType = 'WebRTC' | 'PostMessage' | 'HttpFetch' | 'HttpRest';
export const ChannelType = {
  WebRTC: 'WebRTC' as ChannelType,
  PostMessage: 'PostMessage' as ChannelType,
  HttpFetch: 'HttpFetch' as ChannelType,
  HttpRest: 'HttpRest' as ChannelType,
} as const;

export type ChannelState = Record<string, any>;
export type ChannelSettings = Record<string, any>;
export type ChannelTimeout = number;

export type ChannelPeer = Partial<{
  identifier: Identifier,
  publicKeys: PublicKeys,
  sharedKey: EncryptionSharedKey,
}> & Record<string, any>;

export type ChannelEventErrorType<A extends string> = `${A}_ERROR`;

export type ChannelLoggedEvent = ChannelEventInterface & {
  response: true,
  request?: false,
} | ChannelEventInterface & {
  response?: false,
  request: true,
};

export type ChannelEventLog = ChannelLoggedEvent[];

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>

type RequestMethod<Action extends string> = Uncapitalize<CamelCase<Action>>;
type OnRequestMethod<Action extends string> = `on${Capitalize<CamelCase<Action>>}Requested`;

type ConfirmMethod<Action extends string> = `confirm${Capitalize<CamelCase<Action>>}`;
type OnConfirmMethod<Action extends string> = `on${Capitalize<CamelCase<Action>>}Confirmed`;

export type CoreChannelInterface<Actions extends string[]> = {
  channelId: ChannelId,
  type: ChannelType,
  peer: ChannelPeer,
  state: ChannelState,
  settings: ChannelSettings,
  eventLog: ChannelEventLog,

  export(): ChannelExport,
  import(params: ChannelExport): void,
} & {
    [key in RequestMethod<Actions[number]>]: (params?: Partial<ChannelEventParams>) => Promise<any>;
  } & {
    [key in OnRequestMethod<Actions[number]>]: (request: ChannelRequestEvent) => Promise<void>;
  } & {
    [key in ConfirmMethod<Actions[number]>]: (request: ChannelRequestEvent) => Promise<void>;
  } & {
    [key in OnConfirmMethod<Actions[number]>]: (confirm: ChannelConfirmEvent) => Promise<void>;
  }

export type CoreChannelParams = {
  spark: Spark<any, any, any, any, any>,
  channelId?: ChannelId,
  type?: ChannelType,
  peer?: ChannelPeer,
  state?: ChannelState,
  settings?: ChannelSettings,
  actions?: string[],
  eventLog?: ChannelLoggedEvent[],
}

export type CoreChannelActions = ['OPEN', 'CLOSE', 'MESSAGE'];
export const CoreChannelActions = ['OPEN', 'CLOSE', 'MESSAGE'] as const;

export type ChannelRequestParams = Partial<ChannelEventParams> & {
  timeout?: ChannelTimeout,
  [key: string]: any,
}

export type ChannelReceive = (
  callback: ({ event, confirmOpen, rejectOpen }: { event: ChannelEvent, confirmOpen: () => Promise<CoreChannel>, rejectOpen: () => void }) => Promise<void>,
  options: { spark: Spark<any, any, any, any, any>, [key: string]: any }
) => void;

export interface ChannelExport {
  channelId: ChannelId,
  type: ChannelType,
  peer: ChannelPeer,
  settings: ChannelSettings,
  eventLog: ChannelLoggedEvent[],
}