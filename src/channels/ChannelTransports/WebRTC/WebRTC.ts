import { CoreChannel } from "../../CoreChannel";
import { CoreChannelParams, ChannelPeer, ChannelSendRequest, ChannelReceive } from "../../types";
import { OpenClose, Message, ChannelAction, ChannelActionRequest } from "../../ChannelActions";
import Peer, { DataConnection } from "peerjs";
import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "../../ChannelEvent";
import { ChannelError } from "../../../errors/channel";
import { ChannelEventType } from "../../ChannelEvent/types";

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

export type WebRTCMediaStreams = {
  local: MediaStream,
  remote: MediaStream,
}

export type WebRTCParams = CoreChannelParams & {
  connection?: DataConnection,
}

type Actions = ['HANGUP']
const Actions = ['HANGUP'] as const;

class HangUp extends ChannelAction<Actions> {
  public readonly name = 'HangUp';
  public readonly actions = Actions as Actions;
  public HANGUP_REQUEST: ChannelActionRequest = async (params: any) => {
    return await this.channel.dispatchRequest(new ChannelRequestEvent({ ...params })) as ChannelConfirmEvent;
  }
  public HANGUP_CONFIRM: ChannelActionRequest = async (params: any) => {
    const data = params?.data || {};
    const { eventId, ...metadata } = params?.metadata || {};
    return Promise.resolve(new ChannelConfirmEvent({ type: 'HANGUP_CONFIRM', metadata, data }));
  }
}

export class WebRTC extends CoreChannel {
  public readonly type = 'WebRTC';
  public streams: WebRTCMediaStreams;
  private connection: DataConnection;
  private activeCall;

  constructor({ connection, ...params }: WebRTCParams) {
    const openClose = new OpenClose();
    const message = new Message();
    const hangup = new HangUp();
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

    window.addEventListener('beforeunload', async () => {
      await this.close();
      WebRTC.peerjs.destroy();
    }, { capture: true });
  }

  public async open() {
    const action = this.getAction('OPEN_CLOSE') as OpenClose;
    if (this.connection?.open) return await action.OPEN_REQUEST();
    const peerAddress = WebRTC.addressFromIdentifier(this.peer.identifier);
    this.connection = WebRTC.peerjs.connect(peerAddress);
    this.connection.on('data', this.handleResponse);
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
      if (!this.connection.open) {
        return reject('connection not open');
      }

      await this.setLocalStream()
        .catch(reject);

      const call = WebRTC.peerjs.call(WebRTC.addressFromIdentifier(this.peer.identifier), this.streams.local);

      call.on('stream', (stream) => {
        this.streams.remote = stream;
        this.activeCall = call;
        clearTimeout(timer);
        resolve(this.streams);
      });

      call.on('close', () => {
        this.hangup();
      });

      call.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });

      const timer = setTimeout(() => {
        if (!this.streams.remote) {
          this.hangup();
          reject('timeout');
        }
      }, 10000);
    });
  }

  public async hangup() {
    if (this.streams) {
      const action = this.getAction('HANGUP') as HangUp;
      Object.values(this.streams).forEach(stream => {
        stream.getTracks().forEach(track => {
          track.enabled = false;
          track.stop()
        });
      });
      this.streams = null;
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
      return new Promise(async ( _resolve, _reject ) => {
        this.activeCall = call;
        await this.setLocalStream();
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

  private async setLocalStream() {
    if (this.streams?.local) {
      return Promise.resolve();
    }

    this.streams = { local: null, remote: null }
    this.streams.local = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (!this.streams.local) {
      throw new Error('Failed to get local stream');
    }

    return Promise.resolve();
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
          return callback({ event: event, confirmOpen });
        }

        connection.once('data', dataListener);
        WebRTC.peerjs.off('connection', connectionListener);
      }
      WebRTC.peerjs.on('connection', connectionListener)
    })
  }
}