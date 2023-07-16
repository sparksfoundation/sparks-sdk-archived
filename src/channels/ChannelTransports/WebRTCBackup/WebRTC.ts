import { CoreChannel } from "../../CoreChannel";
import { CoreChannelParams, ChannelReceive, ChannelState } from "../../types";
import { OpenClose, Message } from "../../ChannelActions";
import Peer, { DataConnection } from "peerjs";
import { CallHangUp } from "../../ChannelActions/CallHangUp";

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
];

async function isStreamable(): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const hasVideo = devices.some((device) => device.kind === 'videoinput');
          return resolve(hasVideo);
        })
    }
  });
}

export type WebRTCMediaStreams = {
  local: MediaStream,
  remote: MediaStream,
}

export type WebRTCParams = CoreChannelParams & {
  connection?: DataConnection,
}

export class WebRTC extends CoreChannel {
  public readonly type = 'WebRTC';
  public streams: WebRTCMediaStreams;
  private connection: DataConnection;
  declare public state: ChannelState & {
    streams: {
      local: MediaStream,
      remote: MediaStream,
    },
    streamable: boolean,
  };
  private activeCall = null;

  constructor({ connection, ...params }: WebRTCParams) {
    const openClose = new OpenClose();
    const message = new Message();
    const hangup = new CallHangUp();
    super({ ...params, actions: [openClose, message, hangup] });

    this.connection = connection;
    this.handleResponse = this.handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this._handleCalls = this._handleCalls.bind(this);

    const ourAddress = WebRTC.addressFromIdentifier(this.identifier);
    WebRTC.peerjs = WebRTC.peerjs || new Peer(ourAddress, { config: { iceServers } });
    WebRTC.peerjs.on('call', this._handleCalls);

    if (connection) {
      this.connection = connection;
      this.connection.on('data', this.handleResponse);
    }

    this.on([
      this.eventTypes.CLOSE_REQUEST,
      this.eventTypes.CLOSE_CONFIRM,
      this.eventTypes.REQUEST_TIMEOUT_ERROR,
    ], (event) => {
      if (event.type === 'REQUEST_TIMEOUT_ERROR' && event.metadata?.type !== 'CLOSE_REQUEST') {
        return;
      }
      //this.connection.close();
    });

    this.state.streams = null;
    isStreamable().then((streamable) => {
      this.state.streamable = streamable;
    });

    window.addEventListener('beforeunload', async () => {
      await this.close();
      WebRTC.peerjs.destroy();
    }, { capture: true });
  }

  public async open() {
    const action = this.getAction('OPEN_CLOSE') as OpenClose;
    // make sure the connection is available and open
    if (!this.connection?.open) {
      const peerAddress = WebRTC.addressFromIdentifier(this.peer.identifier);
      this.connection = WebRTC.peerjs.connect(peerAddress);
      this.connection.on('data', this.handleResponse);
    }
    return await action.OPEN_REQUEST();
  }

  public async close() {
    const action = this.getAction('OPEN_CLOSE') as OpenClose;
    return await action.CLOSE_REQUEST();
  }

  public async message(message) {
    const action = this.getAction('MESSAGE') as Message;
    return await action.MESSAGE_REQUEST({ data: message });
  }

  public async call() {
    return new Promise(async (resolve, reject) => {
      if (!this.connection.open || this.state.status !== 'OPEN') {
        return reject('connection not open');
      }

      const address = WebRTC.addressFromIdentifier(this.peer.identifier);
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.state.streams.local = localStream;

      const action = this.getAction('CALL_HANGUP') as CallHangUp;
      await action.CALL_REQUEST();

      // call approved setup the streams
      const call = WebRTC.peerjs.call(address, localStream);

      // wait for the remote stream then send the call request
      call.on('stream', async (stream) => {
        this.activeCall = call;
        this.state.streams.remote = stream;
        resolve(this.streams);
      });

      // handle the call closing
      call.once('error', (error) => {
        this.state.streams = null;
        this.activeCall = null;
        reject(error);
      });
    });
  }

  public async hangup() {
    if (this.state.streams) {
      const action = this.getAction('HANGUP') as CallHangUp;

      Object.values(this.state.streams).forEach(stream => {
        stream.getTracks().forEach(track => {
          track.enabled = false;
          track.stop()
        });
      });

      this.state.streams = null;
      return await action.HANGUP_REQUEST();
    }

    if (this.activeCall) {
      this.activeCall.close();
      this.activeCall = null;
    }
  }

  protected async sendRequest(event): Promise<void> {
    return new Promise((resolve, reject) => {
      switch (true) {
        case !this.connection:
          return reject('no connection');
        case this.connection.open:
          this.connection.send(event);
          return resolve();
        case !this.connection.open:
          this.connection.once('open', () => {
            this.connection.send(event);
            return resolve();
          })
          break;
      }
    });
  }

  public async handleResponse(event) {
    return new Promise<void>(async (resolve, reject) => {
      switch (true) {
        case this.connection?.open:
          await super.handleResponse(event);
          return resolve();
        case !this.connection?.open:
          this.connection.once('open', async () => {
            await super.handleResponse(event);
            return resolve();
          })
          break;
      }
    })
  }

  protected static addressFromIdentifier(identifier: string) {
    return identifier.replace(/[^a-zA-Z0-9]/g, '');
  }

  public handleCalls: ({ accept, reject }: { accept: () => Promise<WebRTCMediaStreams>, reject: () => Promise<void> }) => void;
  private _handleCalls(call) {
    if (this.activeCall || !this.handleCalls) {
      return;
    }

    const accept = async (): Promise<WebRTCMediaStreams> => {
      return new Promise(async (_resolve, _reject) => {
        this.activeCall = call;
        call.answer(this.streams.local);
        call.on('close', () => {
          this.hangup();
        });
        call.on('error', (error) => {
          this.hangup();
        });
        call.on('stream', (stream) => {
          this.streams.remote = stream;
          _resolve(this.streams);
        });
      })
    }

    const reject = () => {
      call.close();
      this.activeCall = null;
      return Promise.resolve();
    }

    this.handleCalls({ accept, reject });
  }

  protected static peerjs: Peer;
  public static receive: ChannelReceive = (callback, options) => {
    const { spark } = options;
    const ourAddress = WebRTC.addressFromIdentifier(spark.identifier);

    WebRTC.peerjs = WebRTC.peerjs || new Peer(ourAddress, { config: { iceServers } });
    WebRTC.peerjs.on('open', () => {

      const connectionListener = connection => {
        const dataListener = (event) => {
          const { type, data, metadata } = event;
          if (type !== 'OPEN_REQUEST') return;

          const confirmOpen = () => {
            return new Promise<WebRTC>(async (resolve, reject) => {
              const channel = new WebRTC({
                peer: { ...data.peer },
                spark: spark,
                connection,
                channelId: metadata.channelId,
              });

              channel.on(channel.eventTypes.ANY_ERROR, async (event) => {
                return reject(event);
              });

              await channel.open();
              await channel.handleResponse(event)
              return resolve(channel);
            });
          }

          connection.off('data', dataListener);
          return callback({ event: event, confirmOpen });
        }
        connection.on('data', dataListener);
      }
      WebRTC.peerjs.on('connection', connectionListener)
    })
  }
}