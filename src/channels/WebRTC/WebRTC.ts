import { Spark } from '../../Spark';
import { Channel } from '../Channel/Channel';
import { ChannelActions, ChannelError, ChannelTypes } from '../Channel/types';
import Peer, { DataConnection } from "peerjs";

export class WebRTC extends Channel {
  protected static peerjs: Peer;
  protected peerId: string;
  protected connection: DataConnection
  protected _oncall: Function;

  constructor({ spark, peerId, connection, ...args }: { spark: Spark, peerId: string, connection?: DataConnection, args?: any }) {
    super({ channelType: ChannelTypes.WEB_RTC, spark, ...args });

    this.peerId = peerId.replace(/[^a-zA-Z\-\_]/g, '');
    this.open = this.open.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    if (connection) {
      this.connection = connection;
      this.connection.on('error', err => console.error(err));
      this.connection.on('data', this.receiveMessage);
    }
  }

  public async open(payload?: any, action?: ChannelActions): Promise<Channel | ChannelError> {
    if (WebRTC.peerjs && this.connection) {
      return super.open(payload, action);
    }

    return new Promise((resolve, reject) => {
      const ourId = this.spark.identifier.replace(/[^a-zA-Z\-\_]/g, '');
      WebRTC.peerjs = WebRTC.peerjs || new Peer(ourId);
      WebRTC.peerjs.on('error', err => console.error(err));
      const connection = WebRTC.peerjs.connect(this.peerId);
      connection.on('open', async () => {
        this.connection = connection;
        connection.on('data', this.receiveMessage);
        const result = await super.open(payload, action);
        return resolve(result);
      });
    });
  }

  protected receiveMessage(payload) {
    super.receiveMessage(payload);
  }

  protected sendMessage(payload) {
    this.connection.send(payload);
  }

  static receive(callback, { spark }) {
    WebRTC.peerjs = WebRTC.peerjs || new Peer(spark.identifier.replace(/[^a-zA-Z\-\_]/g, ''));
    WebRTC.peerjs.on('error', err => console.error(err));
    WebRTC.peerjs.on('open', id => {
      WebRTC.peerjs.on('connection', connection => {
        connection.on('data', payload => {
          const options = { connection, peerId: connection.peer, spark };
          const args = Channel.channelRequest({ payload, options, Channel: WebRTC });
          if (args) callback(args);
        })
      })
    })
    window.addEventListener('unload', () => WebRTC.peerjs.destroy());
    window.addEventListener('beforeunload', () => WebRTC.peerjs.destroy());
  }
}