import { Channel, ChannelFactory } from "./Channel.js";
import {
  ChannelClosedReceipt,
  ChannelOpenedReceipt,
  ChannelPrivateEvents,
  ChannelPublicEvents,
  CreateChannelArgs,
  MessageSentReceipt,
  SendMessageArgs
} from "./types.js";
import { randomNonce, timestamp } from "../utilities/index.js";

const CONFIRMATION_TIMEOUT = 10000;

type PostMessageEvent = MessageEvent & {
  data: {
    cid?: string;
    mid?: string;
    type: string;
    payload: any;
  }
}

type ResolveOrReject = [(args: any) => void, (args: any) => void]

export class PostMessageChannel extends Channel {
  private confirmations: Map<ChannelPrivateEvents, ResolveOrReject> = new Map();
  private callbacks: Map<ChannelPublicEvents, (args: any) => void> = new Map();

  constructor(args) {
    super(args);
  }

  /**
   * open initiates the handshake to get the shared key established
   */
  public async open() {
    const target = {
      origin: window.location.origin,
      publicKey: this.spark.controller.encryptionKeys.publicKey,
    }
    this.target.window = window.open(this.target.origin);
    return new Promise<ChannelOpenedReceipt | void>((resolve, reject) => {
      this.confirmations.set(ChannelPrivateEvents.OPEN_CONFIRMATION, [resolve, reject]);
      this.target.window.postMessage({
        cid: this.cid,
        type: ChannelPrivateEvents.OPEN_REQUEST,
        target,
        timestamp: timestamp(),
      }, this.target.origin);
      setTimeout(() => {
        this.callbacks.clear();
        reject({ message: 'channel opened this side but could not get confirmation' })
      }, CONFIRMATION_TIMEOUT)
    });
  }

  /**
   * this kills all channels and removes all listeners
   */
  public async close() {
    return new Promise<ChannelClosedReceipt | void>(async (resolve, reject) => {
      this.send({ data: { type: ChannelPrivateEvents.CLOSE_REQUEST }, confirm: true });
      this.callbacks.clear();
      this.confirmations.set(ChannelPrivateEvents.CLOSE_CONFIRMATION, [resolve, reject]);
      setTimeout(() => {
        this.callbacks.clear();
        reject({ message: 'channel closed this side but could not get confirmation' })
      }, CONFIRMATION_TIMEOUT)
    });
  }

  /**
   * this sends a message to the other side
   */
  public async send(args: SendMessageArgs) {
    const { confirm, data } = args;
    return new Promise<MessageSentReceipt | void>((resolve, reject) => {
      this.confirmations.set(ChannelPrivateEvents.MESSAGE_CONFIRMATION, [resolve, reject]);
      this.target.window.postMessage({
        mid: randomNonce(16),
        type: ChannelPublicEvents.MESSAGE,
        data: data,
        confirm: confirm,
        timestamp: timestamp(),
      }, this.target.origin);
    });
  }

  public on(event: ChannelPublicEvents, callback: (args: any) => void): void {
    this.callbacks.set(event, callback);
  }

  public confirm(event: ChannelPrivateEvents, args: any): void {
    const confirm = this.confirmations.get(event);
    if (!confirm) return;
    const [resolve] = confirm;
    if (resolve) resolve(args);
    this.confirmations.delete(event);
  }

  public reject(event: ChannelPrivateEvents, args: any): void {
    const confirm = this.confirmations.get(event);
    if (!confirm) return;
    const [, reject] = confirm;
    if (reject) reject(args);
    this.confirmations.delete(event);
  }
}

export class PostMessage extends ChannelFactory {
  private handler: (event: PostMessageEvent) => void;
  private channels: { [key: string] : Channel } = {};

  constructor(args) {
    super(args);

    const handleOpenRequest = async (event: PostMessageEvent): Promise<void> => {
      const { cid, target } = event.data;
      const channel = this.channels[cid];
      const { origin, publicKey } = target;
      const sharedKey = await this.spark.cipher.sharedKey({ publicKey });

      // todo here -> need to get the target sorted between sender receiver
      console.log(channel.target.origin, target.origin)
      if (channel.target.origin !== origin || !sharedKey) {
        const payload = { message: 'invalid origin or publicKey' };
        channel.reject(ChannelPrivateEvents.OPEN_CONFIRMATION, payload);
      } else {
        const payload = { message: 'channel opened' };
        channel.confirm(ChannelPrivateEvents.OPEN_CONFIRMATION, payload);
      }
    };
    const handleOpenConfirmation = (event: PostMessageEvent): any => { };
    const handleCloseRequest = (event: PostMessageEvent): any => { };
    const handleCloseConfirmation = (event: PostMessageEvent): any => { };
    const handleMessage = (event: PostMessageEvent): any => { };
    const handleMessageReceipt = (event: PostMessageEvent): any => { };
    const handleOpen = (event: PostMessageEvent): any => { };
    const handleClose = (event: PostMessageEvent): any => { };

    this.handler = (event: PostMessageEvent): void => {
      const { cid, mid, type } = event.data;
      if (!type || !(cid || mid)) {
        return;
      } else if (type === ChannelPrivateEvents.OPEN_REQUEST) {
        handleOpenRequest(event);
      } else if (type === ChannelPrivateEvents.OPEN_CONFIRMATION) {
        handleOpenConfirmation(event);
      } else if (type === ChannelPrivateEvents.CLOSE_REQUEST) {
        handleCloseRequest(event);
      } else if (type === ChannelPrivateEvents.CLOSE_CONFIRMATION) {
        handleCloseConfirmation(event);
      } else if (type === ChannelPrivateEvents.MESSAGE_CONFIRMATION) {
        handleMessageReceipt(event);
      } else if (type === ChannelPublicEvents.MESSAGE) {
        handleMessage(event);
      } else if (type === ChannelPublicEvents.OPEN) {
        handleOpen(event);
      } else if (type === ChannelPublicEvents.CLOSE) {
        handleClose(event);
      }
    }

    window.addEventListener('message', this.handler);
    window.addEventListener('beforeunload', () => {
      Object.keys(this.channels).forEach((cid) => {
        this.channels[cid].close();
      });
    });
  }

  public create(args: CreateChannelArgs) {
    const { request, receive } = args;
    const validRequest = request && request.origin && request.publicKey;
    const validReceive = request && typeof receive === 'function';
    if (!validRequest && !validReceive) {
      throw new Error('invalid channel args, please provide a valid request object, or receive function');
    }

    const channel = new PostMessageChannel({
      spark: this.spark,
      target: request,
    });

    this.channels[channel.cid] = channel;
    return channel;
  }
}

/**
 const handleOpenRequest = (event: PostMessageEvent):any => {
    // if there's no channel id, target or publicKey, return
    // if the channel id already exists, return
    // if the target url is not in the whitelist, return
    // if the publicKey is not in the whitelist, return
};

const handleOpenConfirmation = (event: PostMessageEvent):any => {

};

const handleCloseRequest = (event: PostMessageEvent):any => {

};

const handleCloseConfirmation = (event: PostMessageEvent):any => {

};

const handleMessage = (event: PostMessageEvent):any => {

};

const handleMessageReceipt = (event: PostMessageEvent):any => {

};

const handleError = (event: PostMessageEvent):any => {

};

this.handler = (event: PostMessageEvent):any => {
    const { data = {} } = event;
    const { cid, mid, type, payload } = data || {};
    if (!type || !payload || !(cid || mid)) return;
    if (type === PostMessageEventTypes.OPEN_REQUEST) {
        handleOpenRequest(event);
    } else if (type === PostMessageEventTypes.OPEN_CONFIRMATION) {
        handleOpenConfirmation(event);
    } else if (type === PostMessageEventTypes.CLOSE_REQUEST) {
        handleCloseRequest(event);
    } else if (type === PostMessageEventTypes.CLOSE_CONFIRMATION) {
        handleCloseConfirmation(event);
    } else if (type === PostMessageEventTypes.MESSAGE) {
        handleMessage(event);
    } else if (type === PostMessageEventTypes.MESSAGE_RECEIPT) {
        handleMessageReceipt(event);
    } else if (type === PostMessageEventTypes.ERROR) {
        handleError(event);
    }
}

window.addEventListener('message', this.handler);
window.addEventListener('beforeunload', () =>{
    Promise.all(this.channels.map((channel) => channel.close({ receipt: false })));
});
 */