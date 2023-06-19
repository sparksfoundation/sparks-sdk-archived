import { Channel } from './Channel.js';
import { ChannelError, ChannelTypes } from './types.js';
import { Peer, DataConnection } from "peerjs";

export class WebRTC extends Channel {
  protected peerId: string;
  protected peer: Peer;
  protected conn: DataConnection;
  protected _oncall: Function;

  constructor({ peerId, peer, conn, ...args }) {
    super({ channelType: ChannelTypes.WEB_RTC, ...args });
    if (!peerId) throw new Error('WebRTC channel requires a peerId');
    if (peer && conn) {
      this.peer = peer;
      this.conn = conn;
      this.conn.on('data', this.receiveMessage);
    }
    this.peerId = peerId;
    this.open = this.open.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  public async open(payload, action): Promise<Channel | ChannelError> {
    const isReceiver = this.peer && this.conn;
    if (isReceiver) return super.open(payload, action);

    return new Promise((resolve, reject) => {
      this.peer = new Peer();
      this.peer.on('error', console.log)
      this.peer.on('open', id => {
        console.log('opened')
        console.log(this.peerId)
        const conn = this.peer.connect(this.peerId);
        console.log(conn)

        conn.on('error', console.log)

        conn.on('open', async () => {
          console.log('connected')
          this.conn = conn;
          this.conn.on('data', this.receiveMessage);
          const result = await super.open(payload, action);
          resolve(result);
        });

        this.peer.on('call', function (call) {
          if (!this._oncall) return;

          const accept = () => {
            return new Promise((resolve, reject) => {
              const navigator = window.navigator as any;
              const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
              getUserMedia({ video: true, audio: true }, function (stream) {
                call.answer(stream);
                call.on('stream', function (stream) {
                  resolve(stream);
                });
              });
            });
          }

          const reject = () => {
            call.close();
          }

          this._oncall({ call, accept, reject });
        });
      });
    });
  }

  protected receiveMessage(payload) {
    super.receiveMessage(payload);
  }

  protected sendMessage(payload) {
    this.conn.send(payload);
  }

  protected call() {
    const navigator = window.navigator as any;
    if (!this.peer || !this.conn || !this.peerId) throw new Error('WebRTC channel not open')
    if (!navigator || !navigator.mediaDevices) throw new Error('WebRTC not supported');
    const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
    getUserMedia({ video: true, audio: true }, function (stream) {
      console.log('right here')
      const call = this.peer.call(this.peerId, stream);
      call.on('stream', function (stream) {
        this.stream = stream;
      });
    }, function (err) { console.log('Failed to get local stream', err); } );
  }

  protected oncall(callback) {
    this._oncall = callback;
  }

  static async receive(callback, { spark }) {
    const peer = new Peer();

    peer.on('open', id => {
      console.log(id);

      peer.on('connection', conn => {
        conn.on('open', () => {
          conn.on('data', payload => {

            const args = Channel.channelRequest({
              payload,
              options: {
                peerId: conn.peer,
                peer,
                conn,
                spark,
              },
              Channel: WebRTC,
            });

            if (args) callback(args);
          });
        });
      });
    });
  }
}
