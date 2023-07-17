import Peer from "peerjs";
import { ChannelConfirmEvent, ChannelRequestEvent } from "../../ChannelEvent/index.mjs";
import { CoreChannel } from "../../CoreChannel.mjs";
import { WebRTCActions } from "./types.mjs";
import { ChannelErrors } from "../../../errors/channel.mjs";
const iceServers = [
  { urls: "stun:stun.relay.metered.ca:80" },
  { urls: "turn:a.relay.metered.ca:80", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
  { urls: "turn:a.relay.metered.ca:80?transport=tcp", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
  { urls: "turn:a.relay.metered.ca:443", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
  { urls: "turn:a.relay.metered.ca:443?transport=tcp", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" }
];
const _WebRTC = class extends CoreChannel {
  constructor({ connection, ...params }) {
    const type = "WebRTC";
    super({ ...params, type, actions: [...WebRTCActions] });
    this.state.streamable = null;
    this.state.call = null;
    this.state.streams = {
      local: null,
      remote: null
    };
    if (connection) {
      this.connection = connection;
      this.connection.on("data", this.handleEvent);
    }
    this.setStreamable();
    this.handleEvent = this.handleEvent.bind(this);
    window.addEventListener("beforeunload", async () => {
      await this.hangup();
      await this.close();
    });
  }
  get state() {
    return super.state;
  }
  async setStreamable() {
    return new Promise((resolve) => {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          const hasVideo = devices.some((device) => device.kind === "videoinput");
          this.state.streamable = hasVideo;
          return resolve(hasVideo);
        });
      }
    });
  }
  async getLocalStream() {
    if (!this.state.streamable) {
      const metadata = { channelId: this.channelId };
      return Promise.reject(ChannelErrors.NoStreamsAvailableError({ metadata }));
    }
    if (this.state.streams.local) {
      return Promise.resolve(this.state.streams.local);
    }
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
  }
  async ensurePeerConnection() {
    return new Promise((resolve, reject) => {
      if (this.connection && this.connection.open) {
        return resolve();
      }
      const address = _WebRTC.deriveAddress(this.peer.identifier);
      const connection = _WebRTC.peerjs.connect(address, { reliable: true });
      connection.on("open", () => {
        this.connection = connection;
        this.connection.on("data", this.handleEvent);
        resolve();
      });
      setTimeout(() => {
        if (connection.open)
          return;
        reject(ChannelErrors.ConfirmTimeoutError({ metadata: { channelId: this.channelId } }));
      }, 5e3);
    });
  }
  async handleEvent(event) {
    return super.handleEvent(event);
  }
  async sendEvent(event) {
    this.connection.send(event);
    return Promise.resolve();
  }
  async open(params = {}) {
    await this.ensurePeerConnection();
    return await super.open(params);
  }
  async onCloseRequested(request) {
    await super.onCloseRequested(request);
    setTimeout(() => {
      this.connection.close();
    }, 200);
  }
  async onCloseConfirmed(confirm) {
    await super.onCloseConfirmed(confirm);
    setTimeout(() => {
      this.connection.close();
    }, 200);
  }
  async call(params = {}) {
    const requestEvent = new ChannelRequestEvent({
      type: this.requestTypes.CALL_REQUEST,
      data: { identifier: this.spark.identifier },
      metadata: { channelId: this.channelId }
    });
    const confirmEvent = await this.dispatchRequest(requestEvent, params.timeout || 1e4);
    return confirmEvent;
  }
  async handleCallRequest(request) {
    return Promise.resolve();
  }
  async onCallRequested(request) {
    return new Promise(async (resolve, reject) => {
      const address = _WebRTC.deriveAddress(this.peer.identifier);
      this.state.streams.local = await this.getLocalStream();
      this.handleCallRequest(request).then(() => {
        _WebRTC.peerjs.once("call", async (call) => {
          call.on("stream", (stream) => {
            this.state.call = call;
            this.state.streams.remote = stream;
            resolve();
          });
          if (call.peer !== address)
            return;
          call.answer(this.state.streams.local);
        });
        this.confirmCall(request);
      }).catch((error) => {
        reject(error);
      });
    });
  }
  async onCallConfirmed(confirm) {
    return new Promise(async (resolve, reject) => {
      const address = _WebRTC.deriveAddress(this.peer.identifier);
      this.state.streams.local = await this.getLocalStream();
      this.state.call = _WebRTC.peerjs.call(address, this.state.streams.local);
      this.state.call.on("stream", (remote) => {
        this.state.streams.remote = remote;
        resolve();
      });
    });
  }
  async confirmCall(request) {
    if (!this.state.open) {
      const metadata = { channelId: this.channelId };
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata }));
    }
    const receipt = await this.sealEventData(request);
    const confirmEvent = new ChannelConfirmEvent({
      type: this.confirmTypes.CALL_CONFIRM,
      metadata: { channelId: this.channelId },
      data: { identifier: this.spark.identifier, receipt }
    });
    await this.sendEvent(confirmEvent);
  }
  closeStreams() {
    this.state.call.close();
    this.state.streams.local.getTracks().forEach((track) => track.stop());
    this.state.streams.remote.getTracks().forEach((track) => track.stop());
    this.state.streams.local = null;
    this.state.streams.remote = null;
    this.state.call = null;
  }
  async hangup(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!this.state.open) {
        return reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
      }
      const type = this.requestTypes.HANGUP_REQUEST;
      const metadata = { channelId: this.channelId };
      const data = {};
      const request = new ChannelRequestEvent({ type, metadata, data });
      this.dispatchRequest(request, params.timeout).then((confirm) => {
        resolve(confirm);
      }).catch((error) => {
        this.onHangupConfirmed(null);
        reject(error);
      });
    });
  }
  async confirmHangup(request) {
    if (!this.state.open) {
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
    }
    const receipt = await this.sealEventData(request);
    const confirm = new ChannelConfirmEvent({
      type: this.confirmTypes.HANGUP_CONFIRM,
      metadata: { channelId: this.channelId },
      data: { receipt }
    });
    this.sendEvent(confirm);
  }
  async onHangupRequested(request) {
    await this.confirmHangup(request);
    this.closeStreams();
  }
  async onHangupConfirmed(confirm) {
    this.closeStreams();
  }
  static deriveAddress(identifier) {
    return identifier.replace(/[^a-zA-Z0-9]/g, "");
  }
};
export let WebRTC = _WebRTC;
WebRTC.receive = (callback, options) => {
  const { spark } = options;
  const ourAddress = _WebRTC.deriveAddress(spark.identifier);
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
              channelId: metadata.channelId,
              peer: { ...data.peer },
              connection,
              spark
            });
            channel.on(channel.eventTypes.ANY_ERROR, async (event2) => {
              return reject(event2);
            });
            await channel.handleEvent(event);
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
