"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebRTC = void 0;
var _CoreChannel = require("../../CoreChannel.cjs");
var _ChannelActions = require("../../ChannelActions");
var _peerjs = _interopRequireDefault(require("peerjs"));
var _CallHangUp = require("../../ChannelActions/CallHangUp");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const iceServers = [{
  urls: "stun:stun.relay.metered.ca:80"
}, {
  urls: "turn:a.relay.metered.ca:80",
  username: "6512f3d9d3dcedc7d4f2fc2f",
  credential: "PqVetG0J+Kn//OUc"
}, {
  urls: "turn:a.relay.metered.ca:80?transport=tcp",
  username: "6512f3d9d3dcedc7d4f2fc2f",
  credential: "PqVetG0J+Kn//OUc"
}, {
  urls: "turn:a.relay.metered.ca:443",
  username: "6512f3d9d3dcedc7d4f2fc2f",
  credential: "PqVetG0J+Kn//OUc"
}, {
  urls: "turn:a.relay.metered.ca:443?transport=tcp",
  username: "6512f3d9d3dcedc7d4f2fc2f",
  credential: "PqVetG0J+Kn//OUc"
}];
async function isStreamable() {
  return new Promise(resolve => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const hasVideo = devices.some(device => device.kind === "videoinput");
        return resolve(hasVideo);
      });
    }
  });
}
const _WebRTC = class extends _CoreChannel.CoreChannel {
  constructor({
    connection,
    ...params
  }) {
    const openClose = new _ChannelActions.OpenClose();
    const message = new _ChannelActions.Message();
    const hangup = new _CallHangUp.CallHangUp();
    super({
      ...params,
      actions: [openClose, message, hangup]
    });
    this.type = "WebRTC";
    this.activeCall = null;
    this.connection = connection;
    this.handleResponse = this.handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this._handleCalls = this._handleCalls.bind(this);
    const ourAddress = _WebRTC.addressFromIdentifier(this.identifier);
    _WebRTC.peerjs = _WebRTC.peerjs || new _peerjs.default(ourAddress, {
      config: {
        iceServers
      }
    });
    _WebRTC.peerjs.on("call", this._handleCalls);
    if (connection) {
      this.connection = connection;
      this.connection.on("data", this.handleResponse);
    }
    this.on([this.eventTypes.CLOSE_REQUEST, this.eventTypes.CLOSE_CONFIRM, this.eventTypes.REQUEST_TIMEOUT_ERROR], event => {
      if (event.type === "REQUEST_TIMEOUT_ERROR" && event.metadata?.type !== "CLOSE_REQUEST") {
        return;
      }
    });
    this.state.streams = null;
    isStreamable().then(streamable => {
      this.state.streamable = streamable;
    });
    window.addEventListener("beforeunload", async () => {
      await this.close();
      _WebRTC.peerjs.destroy();
    }, {
      capture: true
    });
  }
  async open() {
    const action = this.getAction("OPEN_CLOSE");
    if (!this.connection?.open) {
      const peerAddress = _WebRTC.addressFromIdentifier(this.peer.identifier);
      this.connection = _WebRTC.peerjs.connect(peerAddress);
      this.connection.on("data", this.handleResponse);
    }
    return await action.OPEN_REQUEST();
  }
  async close() {
    const action = this.getAction("OPEN_CLOSE");
    return await action.CLOSE_REQUEST();
  }
  async message(message) {
    const action = this.getAction("MESSAGE");
    return await action.MESSAGE_REQUEST({
      data: message
    });
  }
  async call() {
    return new Promise(async (resolve, reject) => {
      if (!this.connection.open || this.state.status !== "OPEN") {
        return reject("connection not open");
      }
      const address = _WebRTC.addressFromIdentifier(this.peer.identifier);
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      this.state.streams.local = localStream;
      const action = this.getAction("CALL_HANGUP");
      await action.CALL_REQUEST();
      const call = _WebRTC.peerjs.call(address, localStream);
      call.on("stream", async stream => {
        this.activeCall = call;
        this.state.streams.remote = stream;
        resolve(this.streams);
      });
      call.once("error", error => {
        this.state.streams = null;
        this.activeCall = null;
        reject(error);
      });
    });
  }
  async hangup() {
    if (this.state.streams) {
      const action = this.getAction("HANGUP");
      Object.values(this.state.streams).forEach(stream => {
        stream.getTracks().forEach(track => {
          track.enabled = false;
          track.stop();
        });
      });
      this.state.streams = null;
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
        call.answer(this.streams.local);
        call.on("close", () => {
          this.hangup();
        });
        call.on("error", error => {
          this.hangup();
        });
        call.on("stream", stream => {
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
    this.handleCalls({
      accept,
      reject
    });
  }
};
let WebRTC = _WebRTC;
exports.WebRTC = WebRTC;
WebRTC.receive = (callback, options) => {
  const {
    spark
  } = options;
  const ourAddress = _WebRTC.addressFromIdentifier(spark.identifier);
  _WebRTC.peerjs = _WebRTC.peerjs || new _peerjs.default(ourAddress, {
    config: {
      iceServers
    }
  });
  _WebRTC.peerjs.on("open", () => {
    const connectionListener = connection => {
      const dataListener = event => {
        const {
          type,
          data,
          metadata
        } = event;
        if (type !== "OPEN_REQUEST") return;
        const confirmOpen = () => {
          return new Promise(async (resolve, reject) => {
            const channel = new _WebRTC({
              peer: {
                ...data.peer
              },
              spark,
              connection,
              channelId: metadata.channelId
            });
            channel.on(channel.eventTypes.ANY_ERROR, async event2 => {
              return reject(event2);
            });
            await channel.open();
            await channel.handleResponse(event);
            return resolve(channel);
          });
        };
        connection.off("data", dataListener);
        return callback({
          event,
          confirmOpen
        });
      };
      connection.on("data", dataListener);
    };
    _WebRTC.peerjs.on("connection", connectionListener);
  });
};