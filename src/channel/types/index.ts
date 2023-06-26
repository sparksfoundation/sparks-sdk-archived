import { Identifier } from "../../controller/types";
import { PublicKeys } from "../../types";

// globals
export type ChannelId = string;
export type ChannelEventId = string;
export type ChannelNextId = string;
export type ChannelMessageId = string;
export type ChannelPeer = {
    identifier: Identifier;
    publicKeys: PublicKeys;
}

export enum ChannelType {
    CHANNEL_CORE = 'CHANNEL_CORE',
    POSTMESSAGE = 'POSTMESSAGE',
    WEBSOCKET = 'WEBSOCKET',
    WEBRTC = 'WEBRTC',
    RESTFUL = 'RESTFUL',
}
