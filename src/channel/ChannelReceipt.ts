import { ChannelPeer } from "./types";

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

export type AnyChannelReceipt =
  | ChannelOpenAcceptanceReceipt
  | ChannelOpenConfirmationReceipt
  | ChannelCloseConfirmationReceipt
  | ChannelMessageReceivedReceipt;

export function createReceipt(type: ChannelReceiptType, event: any): AnyChannelReceipt | null {
  switch (type) {
    case ChannelReceiptType.OPEN_ACCEPTED:
      return {
        type: ChannelReceiptType.OPEN_ACCEPTED,
        peers: event.peers,
        eventDigest: event.eventDigest,
      };
    case ChannelReceiptType.OPEN_CONFIRMED:
      return {
        type: ChannelReceiptType.OPEN_CONFIRMED,
        peers: event.peers,
        eventDigest: event.eventDigest,
      };
    case ChannelReceiptType.CLOSE_CONFIRMED:
      return {
        type: ChannelReceiptType.CLOSE_CONFIRMED,
        eventDigest: event.eventDigest,
      };
    case ChannelReceiptType.MESSAGE_RECEIVED:
      return {
        type: ChannelReceiptType.MESSAGE_RECEIVED,
        eventDigest: event.eventDigest,
      };
    default:
      return null; // Receipt type not supported
  }
}
