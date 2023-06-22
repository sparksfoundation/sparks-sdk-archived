import { Identifier, PublicKeys } from "../../controllers";

export type ChannelId = string;
export type EventId = string;
export type MessageId = string;

export enum ChannelEventTypes {
  OPEN_REQUESTED = 'OPEN_REQUESTED',
  OPEN_ACCEPTED = 'OPEN_ACCEPTED',
  OPEN_REJECTED = 'OPEN_REJECTED',
  OPEN_CONFIRMED = 'OPEN_CONFIRMED',

  CLOSE_REQUESTED = 'CLOSE_REQUESTED',
  CLOSE_CONFIRMED = 'CLOSE_CONFIRMED',

  MESSAGE_SENT = 'MESSAGE_SENT',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
}

export enum ChannelErrorTypes {
  OPEN_REQUESTED_ERROR = 'OPEN_REQUESTED_ERROR',
  OPEN_ACCEPTED_ERROR = 'OPEN_ACCEPTED_ERROR',
  OPEN_REJECTED_ERROR = 'OPEN_REJECTED_ERROR',
  OPEN_CONFIRMED_ERROR = 'OPEN_CONFIRMED_ERROR',

  CLOSE_REQUESTED_ERROR = 'CLOSE_REQUESTED_ERROR',
  CLOSE_CONFIRMED_ERROR = 'CLOSE_CONFIRMED_ERROR',

  MESSAGE_SENT_ERROR = 'MESSAGE_SENT_ERROR',
  MESSAGE_RECEIVED_ERROR = 'MESSAGE_RECEIVED_ERROR',
}

export type ChannelReceiptData = {
  timestamp: number,
  channelId: ChannelId,
  type: ChannelEventTypes.OPEN_CONFIRMED,
  peers: [
    { identifier: Identifier, publicKeys: PublicKeys },
    { identifier: Identifier, publicKeys: PublicKeys },
  ]
}

export namespace ChannelEvents {
  export type OpenRequested = {
    eventId: EventId,
    eventType: ChannelEventTypes.OPEN_REQUESTED,
    channelId: ChannelId,
    timestamp: number,
    identifier: Identifier,
    publicKeys: PublicKeys,
    options: Record<string, any>,
  };
  export type OpenAccepted = {
    eventId: EventId,
    eventType: ChannelEventTypes.OPEN_ACCEPTED,
    channelId: ChannelId,
    timestamp: number,
    identifier: Identifier,
    publicKeys: PublicKeys,
    message: string,
    options: Record<string, any>,
    receipt: string,
  };
  export type OpenRejected = {
    eventId: EventId,
    eventType: ChannelEventTypes.OPEN_REJECTED,
    channelId: ChannelId,
  };
  export type OpenConfirmed = {
    eventId: EventId,
    eventType: ChannelEventTypes.OPEN_CONFIRMED,
    channelId: ChannelId,
    timestamp: number,
  };
  export type CloseRequested = {
    eventType: ChannelEventTypes.CLOSE_REQUESTED,
  };
  export type CloseConfirmed = {
    eventType: ChannelEventTypes.CLOSE_CONFIRMED,
  };
  export type MessageSent = {
    eventType: ChannelEventTypes.MESSAGE_SENT,
  };
  export type MessageReceived = {
    eventType: ChannelEventTypes.MESSAGE_RECEIVED,
  };
  export type Error = IChannelError;
  export type EventTypes = OpenRequested | OpenAccepted | OpenRejected | OpenConfirmed | CloseRequested | CloseConfirmed | MessageSent | MessageReceived | Error;
}

export interface IChannelError extends Error {
  eventId: EventId;
  eventType: ChannelErrorTypes;
  channelId: ChannelId;
  messageId?: MessageId;
}

export interface IChannel {
  open(options?: Record<string, any>): void;
  send(args: any): void;
  close(args: any): void;

  on(args: ChannelEvents.EventTypes, callback: (args: any) => void): void;
  off(args: ChannelEvents.EventTypes, callback: (args: any) => void): void;
}

export type IChannelStatic = {
  accept({ details, resolve, reject }: { 
    details: Parameters<IChannelProtected['onOpenRequested']>[0],
    resolve: (message?: string) => Promise<IChannel|IChannelError>,
    reject: (message?: string) => void,
  }): boolean;

  confirm({ details, resolve, reject }: { 
    details: Parameters<IChannelProtected['onOpenRequested']>[0],
    resolve: (message?: string) => Promise<IChannel|IChannelError>,
    reject: (message?: string) => void,
  }): boolean;
}

export type IChannelProtected = {
  onOpenRequested({ eventId, channelId, identifier, publicKeys, options }: ChannelEvents.OpenRequested): void;
  acceptOpen({ eventId, channelId, identifier, publicKeys, options, message }:ChannelEvents.OpenRequested & { message?: string }): Promise<void>;
  onOpenAccepted({ eventId, channelId, identifier, publicKeys, options, message, receipt }: ChannelEvents.OpenAccepted & { receipt: string, message?: string }): Promise<void>;
  confirmOpen(args: any): void;
  onOpenConfirmed(args: any): void;

  requestClose(args: any): void;
  onCloseRequested(args: any): void;

  confirmClose(args: any): void;
  onCloseConfirmed(args: any): void;

  sendMessage(args: any): void;
  onMessageSent(args: any): void;

  confirmMessage(args: any): void;
  onMessageConfirmed(args: any): void;

  incoming(args: any): Promise<{ ok: boolean, error?: Error }>;
  outgoing(args: ChannelEvents.EventTypes): Promise<void | string>;

  handleError({ eventId, channelId, messageId, eventType, message }: { eventId: EventId, channelId: ChannelId, messageId?: MessageId, eventType: ChannelErrorTypes, message: string }): void;
}

export type IChannelPrivate = {
  promises: Map<string, { resolve: Function, reject: Function }>
}

// for extending classes only
export abstract class AChannel {
  protected abstract incoming(args: any): void;

  protected abstract outgoing(args: any): Promise<{ ok: boolean, error?: Error }>;

  static accept(args: any): void {
    throw new Error('Not implemented');
  }
}


