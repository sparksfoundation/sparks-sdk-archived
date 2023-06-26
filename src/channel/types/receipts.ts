import { ChannelPeer } from ".";

export type ChannelReceiptDigest = string;
export type ChannelEventDigest = string;

export enum ChannelReceiptType {
    OPEN_ACCEPTED = 'OPEN_ACCEPTED',
    OPEN_CONFIRMED = 'OPEN_CONFIRMED',
    CLOSE_CONFIRMED = 'CLOSE_CONFIRMED',
    MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
}

export interface ChannelOpenAcceptanceReceipt {
    type: ChannelReceiptType.OPEN_ACCEPTED;
    peers: [ChannelPeer, ChannelPeer];
    eventDigest: ChannelEventDigest;
}

export interface ChannelOpenConfirmationReceipt {
    type: ChannelReceiptType.OPEN_CONFIRMED;
    peers: [ChannelPeer, ChannelPeer];
    eventDigest: ChannelEventDigest;
}

export interface ChannelCloseConfirmationReceipt {
    type: ChannelReceiptType.CLOSE_CONFIRMED;
    eventDigest: ChannelEventDigest;
}

export interface ChannelMessageReceivedReceipt {
    type: ChannelReceiptType.MESSAGE_RECEIVED;
    eventDigest: ChannelEventDigest;
}
