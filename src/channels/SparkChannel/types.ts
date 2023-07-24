import { SparkChannel } from ".";
import { Identifier } from "../../controllers/SparkController/types";
import { SparkConfirmEvent, SparkEvent, SparkRequestEvent } from "../../events/SparkEvent";
import { EventType } from "../../events/SparkEvent/types";
import { Spark } from "../../spark/Spark";
import { PublicKeys } from "../../spark/types";
import { CamelCase } from "../../utilities/types";

export const ChannelTypes: {
  [key: string]: ChannelType
} = {
  WebRTC: 'WebRTC',
  HttpRest: 'HttpRest',
  HttpFetch: 'HttpFetch',
  PostMessage: 'PostMessage',
} as const;

export type ChannelType = 'WebRTC' | 'HttpFetch' | 'HttpRest' | 'PostMessage';
export type ChannelId = string;
export type ChannelPeer = {
  identifier?: Identifier,
  publicKeys?: PublicKeys,
  [key: string]: any,
}
export type ChannelState = {
  [key: string]: any,
}

// make channelevents equal to sparkeventinterface but with everything mandatory 
export type ChannelLoggedEvent = {
  event: SparkEvent, // the original event
  request?: boolean, // set true if we sent the event
  response?: boolean, // set true if we received the event
}

export interface ChannelExport {
  channelId: ChannelId,
  type: ChannelType,
  peer: ChannelPeer,
  eventLog: ChannelLoggedEvent[],
}

// todo - use these to validate receipt and seal shapes
export type SignedReceipt<Shape, Expected> = Shape extends Expected ? string : never;
export type SignedEncryptedData<Shape, Expected> = Shape extends Expected ? string : never;

export type SparkChannelActions = ['OPEN', 'CLOSE', 'MESSAGE'];
export const SparkChannelActions = ['OPEN', 'CLOSE', 'MESSAGE'] as const;

export type RequestMethod<Action extends string> = Uncapitalize<CamelCase<Action>>;
export type OnRequestMethod<Action extends string> = `on${Capitalize<CamelCase<Action>>}Requested`;

type ConfirmMethod<Action extends string> = `confirm${Capitalize<CamelCase<Action>>}`;
export type OnConfirmMethod<Action extends string> = `on${Capitalize<CamelCase<Action>>}Confirmed`;

export type RequestParams = {
  metadata?: Record<string, any>,
  data?: Record<string, any>,
}

export type RequestOptions = {
  timeout?: number,
  retries?: number,
}

export type SparkChannelInterface<Actions extends string[]> = {
  readonly channelId: ChannelId;
  readonly type: ChannelType;
  readonly peer: ChannelPeer;
  readonly state: ChannelState;
  readonly eventLog: ChannelLoggedEvent[];
  readonly eventTypes: {
    [key: string]: EventType
  }

  export(): ChannelExport,
  import(params: ChannelExport): void,
} & {
    [key in RequestMethod<Actions[number]>]: (params: RequestParams, options?: RequestOptions) => Promise<any>;
  } & {
    [key in OnRequestMethod<Actions[number]>]: (event: SparkRequestEvent) => Promise<void>;
  } & {
    [key in ConfirmMethod<Actions[number]>]: (event: SparkRequestEvent) => Promise<void>;
  } & {
    [key in OnConfirmMethod<Actions[number]>]: (event: SparkConfirmEvent) => Promise<void>;
  }

  export type SparkChannelParams = {
    spark: Spark<any, any, any, any, any>,
    channelId?: ChannelId,
    type?: ChannelType,
    peer?: ChannelPeer,
    state?: ChannelState,
    eventLog?: ChannelLoggedEvent[],
    actions?: string[],
  }

  export type ChannelReceive = (
    callback: ({ event, confirmOpen, rejectOpen }: { event: SparkEvent, confirmOpen: () => Promise<SparkChannel>, rejectOpen: () => void }) => Promise<void>,
    options: { spark: Spark<any, any, any, any, any>, [key: string]: any }
  ) => void;