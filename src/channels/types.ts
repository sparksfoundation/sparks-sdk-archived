export type ChannelTarget = { [key: string]: any }; // target options for the channel

export type ChannelOpenedReceipt = {
  cid: string;                                      // unique id for this channel
  timestamp: number;                                // timestamp of when the channel was closed
  signature: string;                                // signature of the channel id & timestamp
};

export type SendMessageArgs = {
  data: string | object | undefined;                // data to send to the other side
  confirm?: boolean;                                // whether to confirm receipt
};

export type MessageSentReceipt = {
  mid: string;                                      // unique id for this message
  data: string | object;                            // data to recieved from the other side
  timestamp: number;                                // timestamp of when the message was sent
  signature: string;                                // signature of the message id, data & timestamp
};

export type ChannelClosedReceipt = {
  cid: string;                                      // unique id for this channel
  timestamp: number;                                // timestamp of when the channel was closed
  signature: string;                                // signature of the channel id & timestamp
};

export type MessagePayload = {
  mid: string;                                      // unique id for this message
  cid: string;                                      // unique id for this channel
  data: string | object;                            // data to recieved from the other side
  timestamp: number;                                // timestamp of when the message was sent
  signature: string;                                // signature of the cid, mid, data & timestamp
};

export type ChannelClosedPayload = {
  cid: string;                                      // unique id for this channel
  timestamp: number;                                // timestamp of when the channel was closed
  signature: string;                                // signature of the channel id & timestamp
};

export type ChannelOpenedPayload = {
  cid: string;                                      // unique id for this channel
  timestamp: number;                                // timestamp of when the channel was opened
  signature: string;                                // signature of the channel id & timestamp
};

export type EventPayload = MessagePayload | ChannelClosedPayload | ChannelOpenedPayload;

export type ChannelEventCallback = (args: EventPayload) => void | never;

export enum ChannelPublicEvents {
  OPEN = 'open',
  MESSAGE = 'message',
  CLOSE = 'close',
}

export enum ChannelPrivateEvents {
  OPEN_REQUEST = 'open-request',
  OPEN_CONFIRMATION = 'open-confirmation',
  MESSAGE_CONFIRMATION = 'message-confirmation',
  CLOSE_REQUEST = 'close-request',
  CLOSE_CONFIRMATION = 'close-confirmation',
}

export interface IChannel {
  cid: string;                                                                      // the unique id for the channel
  target: ChannelTarget;                                                            // the target information of the channel
  on(event: ChannelPublicEvents, callback: ChannelEventCallback): void;             // called before the channel is opened by the other side
  open(): Promise<ChannelOpenedReceipt | void> | never;                             // returns a promise if receipt is true or throws an error
  send(args: SendMessageArgs): Promise<MessageSentReceipt | void> | never;          // returns a promise if receipt is true or throws an error
  close(): Promise<ChannelClosedReceipt | void> | never;                            // returns a promise if receipt is true or throws an error
}

export type RequestChannelArgs = { [key: string]: any };  // target options for the channel
export type ReceiveChannelArgs = { [key: string]: any };  // target options for the channel

export type CreateChannelArgs = {
  request?: RequestChannelArgs;                           // if provided it's an intiator
  receive?: (args: ReceiveChannelArgs) => boolean;        // if provided it's a responder
};

/**
 * ChannelManager Interface
 * it provides a method for creating a channel
 * it should serve as the obvserver for all channels
 * it should manage listeners and callbacks
 * requires a cipher, and signer
 * to extend it to provide other channel factory types, 
 */
export interface IChannelFactory {
  create(args: CreateChannelArgs): IChannel | never;
}
