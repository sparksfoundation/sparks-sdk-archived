// todo - fix import / export and id generation
import { blake3 } from "@noble/hashes/blake3";
import { Spark } from "../../Spark";
import { Identifier } from "../../controllers/types";
import { CoreChannel } from "../CoreChannel";
import { AnyChannelEvent, ChannelEventLog, ChannelEventType, ChannelId, ChannelType, HandleOpenRequested } from "../types";
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

  constructor({
    spark,
    connection,
    cid,
    peerAddress,
    eventLog,
  }: {
    spark: Spark<any, any, any, any, any>,
    connection?: DataConnection,
    cid?: ChannelId,
    peerAddress: string,
    eventLog?: ChannelEventLog,
  }) {
    super({ spark, cid, eventLog });
    console.log(spark.identifier, 'peer', peerAddress)
    this._address = WebRTC.idFromIdentifier(spark.identifier);
    this._peerAddress = WebRTC.idFromIdentifier(peerAddress);
    WebRTC.peerjs = WebRTC.peerjs || new Peer(this._address, { config: { iceServers } });

    this.handleResponse = this.handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);

    this._connection = connection || WebRTC.peerjs.connect(this._peerAddress);
    this._connection.on('data', this.handleResponse);
  }

  public static type: ChannelType = ChannelType.WEBRTC_CHANNEL;
  public get address() { return this._address; }
  public get peerAddress() { return this._peerAddress; }
  public get connection() { return this._connection; }

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
    console.log(identifier)
    const id = util.encodeBase64(blake3(identifier));
    return id.replace(/[^a-zA-Z\-\_]/g, '');
  }

  public async import(data: Record<string, any>) {
    this._address = data.address;
    this._peerAddress = data.peerAddress;
    await super.import(data);
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    const address = this._address;
    const peerAddress = this._peerAddress;
    return Promise.resolve({ ...data, peerAddress, address });
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
            peerAddress: data.identifier,
          });

          channel.handleOpenRequested = callback;
          channel.handleResponse(request);
        });
      }, { once: true })
    })
    window.addEventListener('unload', () => WebRTC.peerjs.destroy());
    window.addEventListener('beforeunload', () => WebRTC.peerjs.destroy());
  }
}