import { blake3 } from "@noble/hashes/blake3";
import { CoreChannel } from "../CoreChannel.mjs";
import { ChannelEventType, ChannelType } from "../types.mjs";
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
const _WebRTC = class extends CoreChannel {
  constructor({
    spark,
    connection,
    cid,
    peerIdentifier,
    eventLog,
    peer
  }) {
    super({ spark, cid, eventLog, peer });
    this._address = _WebRTC.idFromIdentifier(spark.identifier);
    const _peerIdentifier = peer ? peer.identifier || peerIdentifier : peerIdentifier;
    this._peerAddress = _WebRTC.idFromIdentifier(_peerIdentifier);
    this.handleResponse = this.handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this._handleCalls = this._handleCalls.bind(this);
    _WebRTC.peerjs = _WebRTC.peerjs || new Peer(this._address, { config: { iceServers } });
    _WebRTC.peerjs.on("call", this._handleCalls);
    if (connection) {
      this._connection = connection;
      this._connection.on("data", this.handleResponse);
    }
    window.addEventListener("beforeunload", () => {
      this.close();
    }, { capture: true });
  }
  get address() {
    return this._address;
  }
  get peerAddress() {
    return this._peerAddress;
  }
  get connection() {
    return this._connection;
  }
  async open() {
    if (this._connection && this._connection.open) {
      return super.open();
    }
    this._connection = _WebRTC.peerjs.connect(this._peerAddress);
    this._connection.on("data", this.handleResponse);
    return super.open();
  }
  async handleClosed(event) {
    this._connection.off("data", this.handleResponse);
    this.hangup();
    this._connection.close();
    return super.handleClosed(event);
  }
  async handleResponse(response) {
    if (this._connection.open) {
      super.handleResponse(response);
    } else {
      this._connection.on("open", () => {
        super.handleResponse(response);
      }, { once: true });
    }
  }
  async sendRequest(request) {
    return new Promise((resolve, reject) => {
      if (this._connection.open) {
        this._connection.send(request);
        return resolve();
      } else {
        this._connection.on("open", () => {
          this._connection.send(request);
          return resolve();
        }, { once: true });
      }
    });
  }
  static idFromIdentifier(identifier) {
    const id = util.encodeBase64(blake3(identifier));
    return id.replace(/[^a-zA-Z\-\_]/g, "");
  }
  static handleOpenRequests(callback, { spark }) {
    const ourAddress = _WebRTC.idFromIdentifier(spark.identifier);
    _WebRTC.peerjs = _WebRTC.peerjs || new Peer(ourAddress, { config: { iceServers } });
    _WebRTC.peerjs.on("open", () => {
      _WebRTC.peerjs.on("connection", (connection) => {
        connection.on("data", (request) => {
          const { type, metadata, data } = request;
          const { eid, cid } = metadata;
          if (type !== ChannelEventType.OPEN_REQUEST)
            return;
          const channel = new _WebRTC({
            spark,
            cid,
            connection,
            peerIdentifier: data.identifier
          });
          channel.handleOpenRequested = callback;
          channel.handleResponse(request);
        });
      }, { once: true });
    });
    window.addEventListener("unload", () => _WebRTC.peerjs.destroy());
  }
  _handleCalls(call) {
    if (this._call || !this.handleCalls) {
      return;
    }
    const accept = async () => {
      return new Promise(async (_resolve, _reject) => {
        this._call = call;
        await this.setLocalStream();
        call.answer(this._streams.local);
        call.on("close", () => {
          this.hangup();
        });
        call.on("error", (error) => {
          this.hangup();
        });
        call.on("stream", (stream) => {
          this._streams.remote = stream;
          _resolve(this._streams);
        });
      });
    };
    const reject = () => {
      call.close();
      this._call = null;
      return Promise.resolve();
    };
    this.handleCalls({ accept, reject });
  }
  async setLocalStream() {
    if (this._streams?.local) {
      return Promise.resolve();
    }
    this._streams = { local: null, remote: null };
    this._streams.local = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    if (!this._streams.local) {
      throw new Error("Failed to get local stream");
    }
    return Promise.resolve();
  }
  async call() {
    return new Promise(async (resolve, reject) => {
      if (!this._connection.open) {
        return reject("connection not open");
      }
      await this.setLocalStream().catch(reject);
      const call = _WebRTC.peerjs.call(this._peerAddress, this._streams.local);
      call.on("stream", (stream) => {
        this._streams.remote = stream;
        this._call = call;
        clearTimeout(timer);
        resolve(this._streams);
      });
      call.on("close", () => {
        this.hangup();
      });
      call.on("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      const timer = setTimeout(() => {
        if (!this._streams.remote) {
          this.hangup();
          reject("timeout");
        }
      }, 1e4);
    });
  }
  hangup() {
    if (this.handleHangup) {
      this.handleHangup();
    }
    if (this._streams) {
      Object.values(this._streams).forEach((stream) => {
        stream.getTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
        });
      });
      this._streams = null;
    }
    if (this._call) {
      this._call.close();
      this._call = null;
    }
  }
  async import(data) {
    await super.import(data);
    const { peerIdentifier } = data;
    this._peerIdentifier = peerIdentifier;
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    const peerIdentifier = this._peerIdentifier;
    return Promise.resolve({ peerIdentifier, ...data });
  }
};
export let WebRTC = _WebRTC;
WebRTC.type = ChannelType.WEBRTC_CHANNEL;
