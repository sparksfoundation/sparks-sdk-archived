import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent";
import { ChannelEventData, ChannelEventMetadata } from "../ChannelEvent/types";

export type ChannelActionName = string;
export type ChannelActionAttempts = number;
export type ChannelActionRetries = number;
export type ChannelActionTimeout = number;

export type ChannelActionRequest = (params?: {
    data?: ChannelEventData,
    metadata?: Omit<ChannelEventMetadata, 'eventId' | 'nextEventId'> & { nextEventId?: string },
}) => Promise<ChannelConfirmEvent<boolean>>;

export type ChannelActionConfirm = (requestEvent: ChannelRequestEvent<boolean>) => Promise<ChannelConfirmEvent<boolean>>;

export interface ChannelActionContext {
    action: ChannelActionName;
    retries: ChannelActionRetries;
    timeouts: ChannelActionTimeout;
    request: ChannelActionRequest;
    confirm: ChannelActionConfirm;
}

type Request<A extends string> = `${A}_REQUEST`;
type Confirm<A extends string> = `${A}_CONFIRM`;

// if the type is any then don't set the ChannelActionRequest or ChannelActionConfirm
export type ChannelActionInterface<Actions extends string[]> = {
    readonly name: string,
    readonly actions: Actions,
    readonly retries: {
        [key in Actions[number]]: ChannelActionRetries;
    },
    readonly timeouts: {
        [key in Actions[number]]: ChannelActionTimeout;
    },
    setContext: (params: { spark: any, channel: any }) => void,
} & (Actions extends string[] ? {
    [key in Request<Actions[number]>]: ChannelActionRequest;
} & {
    [key in Confirm<Actions[number]>]: ChannelActionConfirm;
} : {})

export type ChannelActionParams<Actions extends string[]> = {
    [key in Actions[number]]?: {
        retries?: ChannelActionRetries,
        timeout?: ChannelActionTimeout,
    }
}