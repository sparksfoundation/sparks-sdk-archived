// todo - fix import / export and id generation
import { blake3 } from "@noble/hashes/blake3";
import { Spark } from "../../Spark";
import { Identifier } from "../../controllers/types";
import { CoreChannel } from "../CoreChannel";
import { AnyChannelEvent, ChannelCloseConfirmationEvent, ChannelCloseEvent, ChannelEventLog, ChannelEventType, ChannelId, ChannelListenerOn, ChannelOpenRejectionEvent, ChannelPeer, ChannelType, HandleOpenRequested } from "../types";
import Peer, { DataConnection } from "peerjs";
import util from 'tweetnacl-util';

export type WebRTCMediaStreams = {
  local: MediaStream,
  remote: MediaStream,
}

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

export class WebRTC extends CoreChannel {
  protected static peerjs: Peer;
  private _call;
  private _connection: DataConnection;
  private _address: string;
  private _streams: WebRTCMediaStreams;
  private _peerAddress: string;
  private _peerIdentifier: string;

  constructor({
    spark,
    connection,
    cid,
    peerIdentifier,
    eventLog,
    peer,
  }: {
    spark: Spark<any, any, any, any, any>,
    connection?: DataConnection,
    cid?: ChannelId,
    peerIdentifier: string,
    eventLog?: ChannelEventLog,
    peer?: ChannelPeer,
  }) {
    super({ spark, cid, eventLog, peer });
    this._address = WebRTC.idFromIdentifier(spark.identifier);
    const _peerIdentifier = peer ? peer.identifier || peerIdentifier : peerIdentifier;
    this._peerAddress = WebRTC.idFromIdentifier(_peerIdentifier);

    this.handleResponse = this.handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this._handleCalls = this._handleCalls.bind(this);

    WebRTC.peerjs = WebRTC.peerjs || new Peer(this._address, { config: { iceServers } });
    WebRTC.peerjs.on('call', this._handleCalls);

    if (connection) {
      this._connection = connection;
      this._connection.on('data', this.handleResponse);
    }

    window.addEventListener('beforeunload', async () => {
      await this.close();
      WebRTC.peerjs.destroy();
    }, { capture: true });
  }

  public static type: ChannelType = ChannelType.WEBRTC_CHANNEL;
  public get address() { return this._address; }
  public get peerAddress() { return this._peerAddress; }
  public get connection() { return this._connection; }

  public async open() {
    if (this._connection && this._connection.open) {
      return super.open();
    }
    this._connection = WebRTC.peerjs.connect(this._peerAddress);
    this._connection.on('data', this.handleResponse);
    return super.open();
  }

  protected async handleClosed(event: ChannelCloseEvent | ChannelCloseConfirmationEvent) {
    this.hangup();
    // todo - figure out this issue, it's preventing the final close confirmation from being sent
    this._connection.close();
    this._connection.off('data', this.handleResponse);
  }

  public async handleResponse(response) {
    return new Promise((resolve, reject) => {
      if (response?.type === 'hangup') {
        this.hangup();
        return resolve(void 0);
      }
      if (this._connection.open) {
        super.handleResponse(response);
        return resolve(void 0);
      } else {
        this._connection.on('open', () => {
          super.handleResponse(response);
          return resolve(void 0);
        }, { once: true });
      }
    })
  }

  protected async sendRequest(request): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._connection) return reject('no connection');
      if (this._connection.open) {
        this._connection.send(request);
        return resolve();
      } else {
        const listener = () => {
          this._connection.send(request);
          this._connection.off('open', listener);
          return resolve();
        }
        this._connection.on('open', listener);
      }
    });
  }

  protected static idFromIdentifier(identifier: Identifier) {
    // hash identifier then remove illegal character
    const id = util.encodeBase64(blake3(identifier));
    return id.replace(/[^a-zA-Z\-\_]/g, '');
  }

  public static handleOpenRequests(callback: HandleOpenRequested, { spark }: { spark: Spark<any, any, any, any, any> }) {
    const ourAddress = WebRTC.idFromIdentifier(spark.identifier);
    WebRTC.peerjs = WebRTC.peerjs || new Peer(ourAddress, { config: { iceServers } });
    WebRTC.peerjs.on('open', () => {
      const connectionListener = connection => {
        const dataListener = (request: AnyChannelEvent) => {
          const { type, metadata, data } = request || {};
          const { eid, cid } = metadata || {};
          if (type !== ChannelEventType.OPEN_REQUEST) return;

          const channel = new WebRTC({
            spark,
            cid,
            connection,
            peerIdentifier: data.identifier,
          });

          channel.handleOpenRequested = callback;
          channel.handleResponse(request);

          WebRTC.peerjs.off('connection', connectionListener);
          connection.off('data', dataListener);
        }
        connection.on('data', dataListener);
      }
      WebRTC.peerjs.on('connection', connectionListener)
    })
  }


  public handleCalls: ({ accept, reject }: { accept: () => Promise<WebRTCMediaStreams>, reject: () => Promise<void> }) => void;
  private _handleCalls(call) {
    if (this._call || !this.handleCalls) {
      return;
    }

    const accept = async (): Promise<WebRTCMediaStreams> => {
      return new Promise(async ( _resolve, _reject ) => {
        this._call = call;
        await this.setLocalStream();
        call.answer(this._streams.local);
        call.on('close', () => {
          this.hangup();
        });
        call.on('error', (error) => {
          this.hangup();
        });
        call.on('stream', (stream) => {
          this._streams.remote = stream;
          _resolve(this._streams);
        });
      })
    }

    const reject = () => {
      call.close();
      this._call = null;
      return Promise.resolve();
    }

    this.handleCalls({ accept, reject });
  }

  private async setLocalStream() {
    if (this._streams?.local) {
      return Promise.resolve();
    }

    this._streams = { local: null, remote: null }
    this._streams.local = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (!this._streams.local) {
      throw new Error('Failed to get local stream');
    }

    return Promise.resolve();
  }

  public async call(): Promise<{ local: MediaStream, remote: MediaStream }> {

    return new Promise(async (resolve, reject) => {
      if (!this._connection.open) {
        return reject('connection not open');
      }

      await this.setLocalStream()
        .catch(reject);

      const call = WebRTC.peerjs.call(this._peerAddress, this._streams.local);

      call.on('stream', (stream) => {
        this._streams.remote = stream;
        this._call = call;
        clearTimeout(timer);
        resolve(this._streams);
      });

      call.on('close', () => {
        this.hangup();
      });

      call.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });

      const timer = setTimeout(() => {
        if (!this._streams.remote) {
          this.hangup();
          reject('timeout');
        }
      }, 10000);
    });
  }

  public handleHangup; 
  public hangup() {
    if (this.handleHangup) {
      this.handleHangup();
    }

    if (this._streams) {
      this._connection.send({
        type: "hangup"
      })
      Object.values(this._streams).forEach(stream => {
        stream.getTracks().forEach(track => {
          track.enabled = false;
          track.stop()
        });
      });
      this._streams = null;
    }

    if (this._call) {
      this._call.close();
      this._call = null;
    }
  }

  public async import(data: Record<string, any>): Promise<void> {
    await super.import(data);
    const { peerIdentifier } = data;
    this._peerIdentifier = peerIdentifier;
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    const peerIdentifier = this._peerIdentifier;
    return Promise.resolve({ peerIdentifier, ...data });
  }
}
