import { Spark } from "../Spark";
import { EncryptionSharedKey } from "../ciphers/types";
import { Identifier } from "../controllers/types";
import { PublicKeys } from "../types";
import { ChannelAction } from "./ChannelActions";
import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "./ChannelEvent";
import { ChannelEventInterface, ChannelEventType } from "./ChannelEvent/types";
import { CoreChannel } from "./CoreChannel";

export type ChannelId = string;

export type ChannelLoggedEvent = (ChannelEventInterface<ChannelEventType, boolean> & {
    response: true,
    request?: false,
}) | (ChannelEventInterface<ChannelEventType, boolean> & {
    response?: false,
    request: true,
});

export interface ChannelExport {
    channelId: ChannelId,
    peer?: ChannelPeer,
    eventLog: ChannelLoggedEvent[],
}

export interface ChannelPeer {
    identifier: Identifier,
    publicKeys: PublicKeys,
    sharedKey: EncryptionSharedKey,
    [key: string]: any,
}

export interface CoreChannelParams {
    spark: Spark<any, any, any, any, any>,
    actions?: ChannelAction<any>[],
    channelId?: ChannelId,
    peer?: {
        identifier: Identifier,
        publicKeys: PublicKeys,
        sharedKey: EncryptionSharedKey,
    }
}

export type DispatchRequest = ({
    event,
    attempt,
}: {
    event: ChannelRequestEvent<boolean>,
    attempt?: number,
}) => Promise<ChannelConfirmEvent<boolean>>;

// for typing the subclass methods
export type ChannelDispatchRequest = (event: ChannelRequestEvent<boolean>, attempt: number) => Promise<ChannelConfirmEvent<boolean>>;
export type ChannelSendRequest = (event: ChannelEvent<ChannelEventType, boolean>) => Promise<void>;

export type ChannelHandleResponse = (event: any) => Promise<void>;
export type ChannelReceive = (
    callback: ({ event, confirmOpen }: { event: ChannelEvent<ChannelEventType, boolean>, confirmOpen: () => Promise<CoreChannel> }) => Promise<void>,
    options: { spark: Spark<any, any, any, any, any>, [key: string]: any }
) => void;