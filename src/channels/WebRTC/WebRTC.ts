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
  protected address: string;
  protected peerAddress: string;

  constructor({
    spark,
    connection,
    cid,
    address,
  }: {
    spark: Spark<any, any, any, any, any>,
    connection?: DataConnection,
    cid?: ChannelId,
    address: string,
  }) {
    super({ spark, cid });
    this.address = WebRTC.idFromIdentifier(spark.identifier);
    this.peerAddress = address;
    WebRTC.peerjs = WebRTC.peerjs || new Peer(this.address, { config: { iceServers } });
    this.connection = connection || WebRTC.peerjs.connect(this.peerAddress);
    this.sendRequest = this.sendRequest.bind(this);
    connection.on('open', async () => {
      connection.on('data', super.handleResponse);
    });
  }

  protected async sendRequest(request) {
    this.connection.send(request);
  }

  protected static idFromIdentifier(identifier: Identifier) {
    // hash identifier then remove illegal character
    const id = util.encodeBase64(blake3(identifier));
    return id.replace(/[^a-zA-Z\-\_]/g, '');
  }

  public static handleOpenRequests(callback: HandleOpenRequested, { spark }: { spark: Spark<any, any, any, any, any> }) {

    const address = WebRTC.idFromIdentifier(spark.identifier);
    WebRTC.peerjs = WebRTC.peerjs || new Peer(address, { config: { iceServers } });
    WebRTC.peerjs.on('error', err => console.error(err));
    WebRTC.peerjs.on('open', () => {
      WebRTC.peerjs.on('connection', connection => {
        connection.on('data', (request: AnyChannelEvent) => {
          const { type, metadata } = request;
          const { eid, cid } = metadata;
          if (type !== ChannelEventType.OPEN_REQUEST) return;

          const channel = new WebRTC({
            spark,
            address,
          });

          channel.handleOpenRequested = callback;
          channel.handleResponse(request);
        });
      })
    })
    window.addEventListener('unload', () => WebRTC.peerjs.destroy());
    window.addEventListener('beforeunload', () => WebRTC.peerjs.destroy());
  }
}