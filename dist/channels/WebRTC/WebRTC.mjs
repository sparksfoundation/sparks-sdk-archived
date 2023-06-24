import { blake3 } from "@noble/hashes/blake3";
import { AChannel, Channel, SparksChannel } from "../Channel/index.mjs";
import Peer from "peerjs";
import util from "tweetnacl-util";
const iceServers = [
  {
    urls: "stun:stun.relay.metered.ca:80"
  },
  {
    urls: "turn:a.relay.metered.ca:80",
    username: "6512f3d9d3dcedc7d4f2fc2f",
    credential: "PqVetG0J+Kn//OUc"
  },
  {
    urls: "turn:a.relay.metered.ca:80?transport=tcp",
    username: "6512f3d9d3dcedc7d4f2fc2f",
    credential: "PqVetG0J+Kn//OUc"
  },
  {
    urls: "turn:a.relay.metered.ca:443",
    username: "6512f3d9d3dcedc7d4f2fc2f",
    credential: "PqVetG0J+Kn//OUc"
  },
  {
    urls: "turn:a.relay.metered.ca:443?transport=tcp",
    username: "6512f3d9d3dcedc7d4f2fc2f",
    credential: "PqVetG0J+Kn//OUc"
  }
];
export class WebRTC extends AChannel {
  constructor({
    spark,
    connection,
    channel,
    address
  }) {
    super({ spark, channel });
    this.address = WebRTC.idFromIdentifier(spark.identifier);
    this.peerAddress = address;
    WebRTC.peerjs = WebRTC.peerjs || new Peer(this.address, { config: { iceServers } });
    this.connection = connection || WebRTC.peerjs.connect(this.peer.address);
    this.handleResponse = this.handleResponse.bind(this);
    this.handleRequest = this.handleRequest.bind(this);
    connection.on("open", async () => {
      connection.on("data", this.handleResponse);
    });
    this.handleRequest = this.handleRequest.bind(this);
    this.channel.setRequestHandler(this.handleRequest);
  }
  get peer() {
    const peer = super.peer;
    return { ...peer, address: this.peerAddress };
  }
  async handleResponse(response) {
    return this.channel.handleResponse(response);
  }
  async handleRequest(request) {
    this.connection.send(request);
  }
  static idFromIdentifier(identifier) {
    const id = util.encodeBase64(blake3(identifier));
    return id.replace(/[^a-zA-Z\-\_]/g, "");
  }
  static receive(callback, {
    spark
  }) {
    const address = WebRTC.idFromIdentifier(spark.identifier);
    WebRTC.peerjs = WebRTC.peerjs || new Peer(address, { config: { iceServers } });
    WebRTC.peerjs.on("error", (err) => console.error(err));
    WebRTC.peerjs.on("open", () => {
      WebRTC.peerjs.on("connection", (connection) => {
        connection.on("data", (data) => {
          const { type, cid } = data;
          if (type !== SparksChannel.Event.Types.OPEN_REQUEST)
            return;
          const channel = new WebRTC({
            spark,
            channel: new Channel({ spark, cid }),
            address
          });
          callback({
            details: data,
            resolve: async () => {
              await channel.acceptOpen(data);
              return channel;
            },
            reject: async () => {
              await channel.rejectOpen(data);
              return null;
            }
          });
        });
      });
    });
    window.addEventListener("unload", () => WebRTC.peerjs.destroy());
    window.addEventListener("beforeunload", () => WebRTC.peerjs.destroy());
  }
}
