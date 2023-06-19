import { Channel } from './Channel.js';
import { ChannelError, ChannelTypes } from './types.js';
import Peer from "simple-peer";

export class WebRTC extends Channel {
  protected peer: Peer;
  protected wrtc: any;
  protected _oncall: Function;

  constructor({ peer, wrtc, ...args }) {
    super({ channelType: ChannelTypes.WEB_RTC, ...args });

    this.wrtc = wrtc;
    this.open = this.open.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    if (peer) {
      this.peer = peer;
      this.peer.on('error', console.log);
      this.peer.on('data', this.receiveMessage);
    }
  }

  public async open(payload, action): Promise<Channel | ChannelError> {
    if (this.peer) return super.open(payload, action);

    return new Promise((resolve, reject) => {
      const options = { wrtc: this.wrtc, initiator: true };
      const peer = new Peer(options);
      peer.on('error', console.log);
      peer.on('connect', async () => {
        peer.on('data', this.receiveMessage)
        const result = await super.open(payload, action);
        resolve(result);
      });
    });
  }

  protected receiveMessage(payload) {
    super.receiveMessage(payload);
  }

  protected sendMessage(payload) {
    this.peer.send(payload);
  }

  static receive(callback, { spark, wrtc = {} }) {
    const peer = new Peer({ wrtc });
    peer.on('signal', console.log);
    peer.on('error', console.log);
    peer.on('connect', () => {
      peer.on('data', payload => {
        const options = { peer, spark, wrtc };
        const args = Channel.channelRequest({ payload, options, Channel: WebRTC });
        if (args) callback(args);
      });
    });
  }
}