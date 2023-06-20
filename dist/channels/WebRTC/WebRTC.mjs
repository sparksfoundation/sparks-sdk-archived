import { Channel } from "../Channel/Channel.mjs";
import { ChannelTypes } from "../Channel/types.mjs";
import Peer from "peerjs";
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
export class WebRTC extends Channel {
  constructor({ spark, peerId, connection, ...args }) {
    super({ channelType: ChannelTypes.WEB_RTC, spark, ...args });
    this.peerId = peerId.replace(/[^a-zA-Z\-\_]/g, "");
    this.open = this.open.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    if (connection) {
      this.connection = connection;
      this.connection.on("error", (err) => console.error(err));
      this.connection.on("data", this.receiveMessage);
    }
  }
  async open(payload, action) {
    if (WebRTC.peerjs && this.connection) {
      return super.open(payload, action);
    }
    return new Promise((resolve, reject) => {
      const ourId = this.spark.identifier.replace(/[^a-zA-Z\-\_]/g, "");
      WebRTC.peerjs = WebRTC.peerjs || new Peer(ourId, { config: { iceServers } });
      WebRTC.peerjs.on("error", (err) => console.error(err));
      const connection = WebRTC.peerjs.connect(this.peerId);
      connection.on("open", async () => {
        this.connection = connection;
        connection.on("data", this.receiveMessage);
        const result = await super.open(payload, action);
        return resolve(result);
      });
    });
  }
  receiveMessage(payload) {
    super.receiveMessage(payload);
  }
  sendMessage(payload) {
    this.connection.send(payload);
  }
  static receive(callback, { spark }) {
    WebRTC.peerjs = WebRTC.peerjs || new Peer(spark.identifier.replace(/[^a-zA-Z\-\_]/g, ""), { config: { iceServers } });
    WebRTC.peerjs.on("error", (err) => console.error(err));
    WebRTC.peerjs.on("open", (id) => {
      WebRTC.peerjs.on("connection", (connection) => {
        connection.on("data", (payload) => {
          const options = { connection, peerId: connection.peer, spark };
          const args = Channel.channelRequest({ payload, options, Channel: WebRTC });
          if (args)
            callback(args);
        });
      });
    });
    window.addEventListener("unload", () => WebRTC.peerjs.destroy());
    window.addEventListener("beforeunload", () => WebRTC.peerjs.destroy());
  }
}
