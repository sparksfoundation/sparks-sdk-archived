import { Spark } from "../Spark";
import { EncryptionSharedKey } from "../ciphers/types";
import { Identifier } from "../controllers/types";
import { PublicKeys } from "../types";
import { ChannelAction } from "./ChannelActions";
import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "./ChannelEvent";
import { ChannelEventInterface, ChannelEventType } from "./ChannelEvent/types";
import { CoreChannel } from "./CoreChannel";

type Nullable<T> = T | null;

export type ChannelId = string;

export type ChannelType = 'WebRTC' | 'PostMessage' | 'HttpFetch' | 'HttpRest';

export type ChannelLoggedEvent = (ChannelEventInterface<ChannelEventType> & {
    response: true,
    request?: false,
}) | (ChannelEventInterface<ChannelEventType> & {
    response?: false,
    request: true,
});

export interface ChannelExport {
    type: ChannelType,
    peer: ChannelPeer,
    channelId: ChannelId,
    eventLog: ChannelLoggedEvent[],
}

export interface ChannelPeer {
    identifier?: Identifier,
    publicKeys?: PublicKeys,
    sharedKey?: EncryptionSharedKey,
    [key: string]: any,
}

export interface CoreChannelParams {
    spark: Spark<any, any, any, any, any>,
    actions?: ChannelAction<any>[],
    channelId?: ChannelId,
    peer?: ChannelPeer,
    eventLog?: ChannelLoggedEvent[],
    timeout?: Nullable<number>,
}

export interface ChannelState {
  [key: string]: any,
}

export type DispatchRequest = ({
    event,
    attempt,
}: {
    event: ChannelRequestEvent,
    attempt?: number,
}) => Promise<ChannelConfirmEvent>;

// for typing the subclass methods
export type ChannelDispatchRequest = (event: ChannelRequestEvent, attempt: number) => Promise<ChannelConfirmEvent>;
export type ChannelSendRequest = (event: ChannelEvent<ChannelEventType>) => Promise<void>;

export type ChannelHandleResponse = (event: any) => Promise<void>;
export type ChannelReceive = (
    callback: ({ event, confirmOpen }: { event: ChannelEvent<ChannelEventType>, confirmOpen: () => Promise<CoreChannel> }) => Promise<void>,
    options: { spark: Spark<any, any, any, any, any>, [key: string]: any }
) => void;