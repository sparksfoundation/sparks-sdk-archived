import { SharedEncryptionKey } from "../ciphers/types";

export type MessageArgs = {
  data: string | object;              // data to send to the other side
  receipt: boolean;                   // whether to wait for a receipt
};

export type MessagePayload = {
  mid: string;                        // unique id for this message
  data: string | object;              // data to recieved from the other side
  timestamp: number;                  // timestamp of when the message was sent
};

export type MessageSentReceipt = {
  mid: string;                        // unique id for this message
  data: string | object;              // data to recieved from the other side
  timestamp: number;                  // timestamp of when the message was sent
  signature: string;                  // signature of the message id, data & timestamp
};

export type MessageError = {
  mid: string;                        // unique id for this message
  error: Error;                       // the error that occurred
  timestamp: number;                  // timestamp of when the error occurred
};

export type ChannelCloseArgs = {
  receipt: boolean;                   // whether to wait for a receipt
};

export type ChannelOnClosePayload = {
  cid: string;                        // unique id for this channel
  closed: number;                     // timestamp of when the channel was closed
  signature: string;                  // signature of the channel id
}

export type ChannelOpenedReceipt = {
  cid: string;                        // unique id for this channel
  timestamp: number;                  // timestamp of when the channel was closed
  signature: string;                  // signature of the channel id & timestamp
};

export type ChannelClosedReceipt = {
  cid: string;                        // unique id for this channel
  timestamp: number;                  // timestamp of when the channel was closed
  signature: string;                  // signature of the channel id & timestamp
};

export type ChannelBeforeOpenPayload = {
  cid: string;                        // unique id for this channel
  channel: IChannel;                  // the channel that was opened
  timestamp: number;                  // timestamp of when the channel was opened
  signature: string;                  // signature of the channel id & timestamp
};

export type ChannelOnOpenPayload = {
  cid: string;                        // unique id for this channel
  channel: IChannel;                  // the channel that was opened
  signature: string;                  // signature of the channel id
  timestamp: number;                  // timestamp of when the channel was opened
};

export type ChannelError = {
  cid: string;                        // unique id for this channel
  error: Error;                       // the error that occurred
  timestamp: number;                  // timestamp of when the error occurred
};  

export type ChannelTarget = { [key: string]: any }; // target options for the channel
export type ChannelSend = (args: MessageArgs) => Promise<MessageSentReceipt | void> | never;
export type ChannelClose = (args: ChannelCloseArgs) => Promise<ChannelClosedReceipt | void> | never;
export type ChannelBeforeOpen = (args: ChannelBeforeOpenPayload) => boolean | void;
export type ChannelOnOpen = (args: ChannelOnOpenPayload) => void | never;
export type ChannelOnClose = (args: ChannelOnClosePayload) => void | never;
export type ChannelOnMessage = (args: MessagePayload) => void | never;
export type ChannelOnError = (args: MessageError | ChannelError) => void | never;
export type ChannelCallbacks = {
  beforeOpen?: ChannelBeforeOpen;     // called before the channel is opened by the other side
  onOpen?: ChannelOnOpen;             // called when the channel is opened by the other side
  onMessage?: ChannelOnMessage;       // called when a message is received from the other side
  onClose?: ChannelOnClose;           // called when the channel is closed by the other side
  onError?: ChannelOnError;           // called when an error occurs
}

export type OpenChannelArgs = {
  target?: ChannelTarget;               // if provided it's an intiator, if not it's a responder
  receipt?: boolean;                    // whether to wait for a receipt
  beforeOpen?: ChannelOnOpen;           // called before the channel is opened by the other side
  onOpen?: ChannelBeforeOpen;           // called when the channel is opened by the other side
  onClose?: ChannelOnClose;             // called when the channel is closed by the other side
  onMessage?: ChannelOnMessage;         // called when a message is received from the other side
  onError?: ChannelOnError;             // called when an error occurs
};

export type CloseChannelArgs = {
  cid?: string[];                       // the ids of the channels to close, if not provided all channels are closed
  receipt?: boolean;                    // whether to wait for a receipt
};

export interface IChannel {
  cid: string;                                                                      // the unique id for the channel
  target: ChannelTarget;                                                            // the target of the channel
  sharedKey: SharedEncryptionKey;                                                   // the shared key for the channel
  callbacks: ChannelCallbacks;
  send(args: MessageArgs): Promise<MessageSentReceipt | void> | never;              // returns a promise if receipt is true or throws an error
  close(args: ChannelCloseArgs): Promise<ChannelClosedReceipt | void> | never;      // returns a promise if receipt is true or throws an error
}

/**
 * ChannelManager Interface
 * it provides a method for opening a channel
 * it provides a method for closing all channels
 * it should serve as the obvserver for all channels
 * it should manage listeners and callbacks
 * requires a cipher, and signer
 * to extend it to provide other channel factory types, 
 */
export interface IChannelManager {
  channels: IChannel[];                           // the channels that have been opened by this factory
  open(args: OpenChannelArgs): Promise<ChannelOpenedReceipt | void>;     // starts the process of opening a channel
  close(args: CloseChannelArgs): Promise<ChannelClosedReceipt[] | void> | never;                          // closes all open channels
}
