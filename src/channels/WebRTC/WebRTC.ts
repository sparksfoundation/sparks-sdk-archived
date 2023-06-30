import { blake3 } from "@noble/hashes/blake3";
import { Spark } from "../../Spark";
import { Identifier } from "../../controllers/types";
import { CoreChannel } from "../CoreChannel";
import { AnyChannelEvent, ChannelEventType, ChannelId, HandleOpenRequested } from "../types";
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
  protected connection: DataConnection;
  public readonly address: string;
  public readonly peerAddress: string;

  constructor({
    spark,
    connection,
    cid,
    peerAddress,
  }: {
    spark: Spark<any, any, any, any, any>,
    connection?: DataConnection,
    cid?: ChannelId,
    peerAddress: string,
  }) {
    super({ spark, cid });
    this.address = WebRTC.idFromIdentifier(spark.identifier);
    this.peerAddress = WebRTC.idFromIdentifier(peerAddress);
    WebRTC.peerjs = WebRTC.peerjs || new Peer(this.address, { config: { iceServers } });

    this._handleResponse = this._handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);

    this.connection = connection || WebRTC.peerjs.connect(this.peerAddress);
    this.connection.on('error', console.log)
    this.connection.on('data', this._handleResponse);
  }

  public async _handleResponse(response) {
    if (this.connection.open) {
      super.handleResponse(response);
    } else {
      this.connection.on('open', () => {
        this.connection.on('data', console.log);
        super.handleResponse(response)
      }, { once: true });
    }
  }

  protected async sendRequest(request): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connection.open) {
        this.connection.send(request);
        return resolve();
      } else {
        this.connection.on('open', () => {
          this.connection.send(request);
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
    WebRTC.peerjs.on('error', err => console.error(err));
    WebRTC.peerjs.on('open', () => {
      WebRTC.peerjs.on('connection', connection => {
        connection.on('data', (request: AnyChannelEvent) => {
          const { type, metadata, data } = request;
          const { eid, cid } = metadata;
          if (type !== ChannelEventType.OPEN_REQUEST) return;

          const channel = new WebRTC({
            spark,
            connection,
            peerAddress: data.identifier,
          });

          channel.handleOpenRequested = callback;
          channel._handleResponse(request);
        });
      }, { once: true })
    })
    window.addEventListener('unload', () => WebRTC.peerjs.destroy());
    window.addEventListener('beforeunload', () => WebRTC.peerjs.destroy());
  }
}