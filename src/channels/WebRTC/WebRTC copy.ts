import { Spark } from '../../Spark';
import { Channel } from '../Channel/Channel';
import { ChannelActions, ChannelError, ChannelTypes } from '../Channel/types';
import Peer, { DataConnection } from "peerjs";

const iceServers = [
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  {
    urls: "turn:a.relay.metered.ca:80",
    username: "6512f3d9d3dcedc7d4f2fc2f",
    credential: "PqVetG0J+Kn//OUc",
  },
  {
    urls: "turn:a.relay.metered.ca:80?transport=tcp",
    username: "6512f3d9d3dcedc7d4f2fc2f",
    credential: "PqVetG0J+Kn//OUc",
  },
  {
    urls: "turn:a.relay.metered.ca:443",
    username: "6512f3d9d3dcedc7d4f2fc2f",
    credential: "PqVetG0J+Kn//OUc",
  },
  {
    urls: "turn:a.relay.metered.ca:443?transport=tcp",
    username: "6512f3d9d3dcedc7d4f2fc2f",
    credential: "PqVetG0J+Kn//OUc",
  },
]

export class WebRTC extends Channel {
  protected static peerjs: Peer;
  protected peerId: string;
  protected connection: DataConnection

  constructor({ spark, peerId, connection, oncall, ...args }: { spark: Spark, peerId: string, oncall?: (args: any) => void, connection?: DataConnection, args?: any }) {
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

    if (oncall) {
      WebRTC.peerjs.on('call', (call) => {
        const accept = async () => {
          return new Promise((resolve, reject) => {
            const navigator = window.navigator || {} as any;
            const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if (!getUserMedia) return reject({ error: 'getUserMedia not supported' });
            getUserMedia({ video: true, audio: true }, function (stream) {
              call.answer(stream); // Answer the call with an A/V stream.
              call.on('stream', function (remoteStream) {
                // Show stream in some video/canvas element.
                return resolve(remoteStream);
              });
            }, (err) => {
              return reject({ error: err });
            });
          });
        }
        oncall({ call, accept })
      });
    }
  }

  public async open(payload?: any, action?: ChannelActions): Promise<Channel | ChannelError> {
    if (WebRTC.peerjs && this.connection) {
      return super.open(payload, action);
    }

    return new Promise((resolve, reject) => {
      const ourId = this.spark.identifier.replace(/[^a-zA-Z\-\_]/g, '');
      WebRTC.peerjs = WebRTC.peerjs || new Peer(ourId, { config: { iceServers } });
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

  public async call() {
    return new Promise((resolve, reject) => {
      const navigator = window.navigator || {} as any;
      const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) return resolve({ error: 'getUserMedia not supported' });
      getUserMedia({ video: true, audio: true }, (stream) => {
        const call = WebRTC.peerjs.call(this.peerId, stream);
        call.on('stream', (remoteStream) => {
          return resolve(remoteStream);
        });
      }, (err) => reject({ error: err }));
    })
  }

  protected receiveMessage(payload) {
    super.receiveMessage(payload);
  }

  protected sendMessage(payload) {
    this.connection.send(payload);
  }

  static receive(callback: ({ details, resolve, reject }) => void, { spark, oncall }: { spark: Spark, oncall?: (args: any) => void }) {
    WebRTC.peerjs = WebRTC.peerjs || new Peer(spark.identifier.replace(/[^a-zA-Z\-\_]/g, ''), { config: { iceServers } });
    WebRTC.peerjs.on('error', err => console.error(err));
    WebRTC.peerjs.on('open', id => {
      WebRTC.peerjs.on('connection', connection => {
        connection.on('data', payload => {
          const options = { connection, peerId: connection.peer, spark, oncall };
          const args = Channel.channelRequest({ payload, options, Channel: WebRTC });
          if (args) callback(args);
        })
      })
    })
    window.addEventListener('unload', () => WebRTC.peerjs.destroy());
    window.addEventListener('beforeunload', () => WebRTC.peerjs.destroy());
  }
}