// todo - fix import / export and id generation
import { blake3 } from "@noble/hashes/blake3";
import { Spark } from "../../Spark";
import { Identifier } from "../../controllers/types";
import { CoreChannel } from "../CoreChannel";
import { AnyChannelEvent, ChannelCloseConfirmationEvent, ChannelCloseEvent, ChannelEventLog, ChannelEventType, ChannelId, ChannelOpenRejectionEvent, ChannelPeer, ChannelType, HandleOpenRequested } from "../types";
import Peer, { DataConnection } from "peerjs";
import util from 'tweetnacl-util';

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
  private _connection: DataConnection;
  private _address: string;
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

    WebRTC.peerjs = WebRTC.peerjs || new Peer(this._address, { config: { iceServers } });

    this.handleResponse = this.handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);

    if (connection) {
      this._connection = connection;
      this._connection.on('data', this.handleResponse);
    }

    window.addEventListener('beforeunload', () => {
      this.close()
    }, { capture: true });
  }

  public static type: ChannelType = ChannelType.WEBRTC_CHANNEL;
  public get address() { return this._address; }
  public get peerAddress() { return this._peerAddress; }
  public get connection() { return this._connection; }

  public async open() {
    if (this._connection) return super.open();
    this._connection = WebRTC.peerjs.connect(this._peerAddress);
    this._connection.on('data', this.handleResponse);
    return super.open();
  }

  protected async handleClosed(event: ChannelCloseEvent | ChannelCloseConfirmationEvent) {
    this._connection.off('data', this.handleResponse);
    this._connection.close();
    return super.handleClosed(event);
  }

  public async handleResponse(response) {
    if (this._connection.open) {
      super.handleResponse(response);
    } else {
      this._connection.on('open', () => {
        super.handleResponse(response)
      }, { once: true });
    }
  }

  protected async sendRequest(request): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._connection.open) {
        this._connection.send(request);
        return resolve();
      } else {
        this._connection.on('open', () => {
          this._connection.send(request);
          return resolve();
        }, { once: true });
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
      WebRTC.peerjs.on('connection', connection => {
        connection.on('data', (request: AnyChannelEvent) => {
          const { type, metadata, data } = request;
          const { eid, cid } = metadata;
          if (type !== ChannelEventType.OPEN_REQUEST) return;

          const channel = new WebRTC({
            spark,
            cid,
            connection,
            peerIdentifier: data.identifier,
          });

          channel.handleOpenRequested = callback;
          channel.handleResponse(request);
        });
      }, { once: true })
    })
    window.addEventListener('unload', () => WebRTC.peerjs.destroy());
  }

  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    const peerIdentifier = this._peerIdentifier;
    return Promise.resolve({ peerIdentifier, ...data });
  }
}
