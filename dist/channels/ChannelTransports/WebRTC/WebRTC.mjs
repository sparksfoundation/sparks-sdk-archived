import { CoreChannel } from "../../CoreChannel.mjs";
import { OpenClose, Message } from "../../ChannelActions/index.mjs";
import Peer from "peerjs";
import { CallHangUp } from "../../ChannelActions/CallHangUp.mjs";
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
  constructor({ connection, ...params }) {
    const openClose = new OpenClose();
    const message = new Message();
    const hangup = new CallHangUp();
    super({ ...params, actions: [openClose, message, hangup] });
    this.type = "WebRTC";
    this.connection = connection;
    this.handleResponse = this.handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this._handleCalls = this._handleCalls.bind(this);
    const ourAddress = _WebRTC.addressFromIdentifier(this.identifier);
    _WebRTC.peerjs = _WebRTC.peerjs || new Peer(ourAddress, { config: { iceServers } });
    _WebRTC.peerjs.on("call", this._handleCalls);
    if (connection) {
      this.connection = connection;
      this.connection.on("data", this.handleResponse);
    }
    window.addEventListener("beforeunload", async () => {
      await this.close();
      _WebRTC.peerjs.destroy();
    }, { capture: true });
  }
  async open() {
    const action = this.getAction("OPEN_CLOSE");
    if (this.connection?.open)
      return await action.OPEN_REQUEST();
    const peerAddress = _WebRTC.addressFromIdentifier(this.peer.identifier);
    this.connection = _WebRTC.peerjs.connect(peerAddress);
    this.connection.on("data", this.handleResponse);
    this.on([
      this.eventTypes.CLOSE_REQUEST,
      this.eventTypes.CLOSE_CONFIRM,
      this.eventTypes.REQUEST_TIMEOUT_ERROR
    ], (event) => {
      if (event.type === "REQUEST_TIMEOUT_ERROR" && event.metadata?.type !== "CLOSE_REQUEST") {
        return;
      }
      this.connection.close();
    });
    return await action.OPEN_REQUEST();
  }
  async close() {
    const action = this.getAction("OPEN_CLOSE");
    await action.CLOSE_REQUEST();
    this.connection.close();
    return Promise.resolve();
  }
  async message(message) {
    const action = this.getAction("MESSAGE");
    return await action.MESSAGE_REQUEST({ data: message });
  }
  async call() {
    return new Promise(async (resolve, reject) => {
      if (!this.connection.open) {
        return reject("connection not open");
      }
      await this.setLocalStream().catch(reject);
      const call = _WebRTC.peerjs.call(_WebRTC.addressFromIdentifier(this.peer.identifier), this.streams.local);
      call.on("stream", (stream) => {
        this.streams.remote = stream;
        this.activeCall = call;
        clearTimeout(timer);
        resolve(this.streams);
      });
      call.on("close", () => {
        this.hangup();
      });
      call.on("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      const timer = setTimeout(() => {
        if (!this.streams.remote) {
          this.hangup();
          reject("timeout");
        }
      }, 1e4);
    });
  }
  async hangup() {
    if (this.streams) {
      const action = this.getAction("HANGUP");
      Object.values(this.streams).forEach((stream) => {
        stream.getTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
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
  async sendRequest(event) {
    return new Promise((resolve, reject) => {
      switch (true) {
        case !this.connection:
          return reject("no connection");
        case this.connection.open:
          this.connection.send(event);
          return resolve();
        case !this.connection.open:
          this.connection.once("open", () => {
            this.connection.send(event);
            return resolve();
          });
          break;
      }
    });
  }
  async handleResponse(event) {
    return new Promise(async (resolve, reject) => {
      switch (true) {
        case this.connection?.open:
          await super.handleResponse(event);
          return resolve();
        case !this.connection?.open:
          this.connection.once("open", async () => {
            await super.handleResponse(event);
            return resolve();
          });
          break;
      }
    });
  }
  static addressFromIdentifier(identifier) {
    return identifier.replace(/[^a-zA-Z0-9]/g, "");
  }
  _handleCalls(call) {
    if (this.activeCall || !this.handleCalls) {
      return;
    }
    const accept = async () => {
      return new Promise(async (_resolve, _reject) => {
        this.activeCall = call;
        await this.setLocalStream();
        call.answer(this.streams.local);
        call.on("close", () => {
          this.hangup();
        });
        call.on("error", (error) => {
          this.hangup();
        });
        call.on("stream", (stream) => {
          this.streams.remote = stream;
          _resolve(this.streams);
        });
      });
    };
    const reject = () => {
      call.close();
      this.activeCall = null;
      return Promise.resolve();
    };
    this.handleCalls({ accept, reject });
  }
  async setLocalStream() {
    if (this.streams?.local) {
      return Promise.resolve();
    }
    this.streams = { local: null, remote: null };
    this.streams.local = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    if (!this.streams.local) {
      throw new Error("Failed to get local stream");
    }
    return Promise.resolve();
  }
};
export let WebRTC = _WebRTC;
WebRTC.receive = (callback, options) => {
  const { spark } = options;
  const ourAddress = _WebRTC.addressFromIdentifier(spark.identifier);
  _WebRTC.peerjs = _WebRTC.peerjs || new Peer(ourAddress, { config: { iceServers } });
  _WebRTC.peerjs.on("open", () => {
    const connectionListener = (connection) => {
      const dataListener = (event) => {
        const { type, data, metadata } = event;
        if (type !== "OPEN_REQUEST")
          return;
        const confirmOpen = () => {
          return new Promise(async (resolve, reject) => {
            const channel = new _WebRTC({
              peer: { ...data.peer },
              spark,
              connection,
              channelId: metadata.channelId
            });
            channel.on(channel.eventTypes.ANY_ERROR, async (event2) => {
              return reject(event2);
            });
            await channel.open();
            await channel.handleResponse(event);
            return resolve(channel);
          });
        };
        connection.off("data", dataListener);
        return callback({ event, confirmOpen });
      };
      connection.on("data", dataListener);
    };
    _WebRTC.peerjs.on("connection", connectionListener);
  });
};
