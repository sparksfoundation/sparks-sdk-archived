import Peer from "peerjs";
import { ChannelConfirmEvent, ChannelRequestEvent } from "../../ChannelEvent/index.mjs";
import { CoreChannel } from "../../CoreChannel.mjs";
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
    super({ ...params, type });
    if (connection) {
      this.connection = connection;
      this.connection.on("data", this.handleEvent);
    }
    this.getStreamable().then((streamable) => {
      this.settings.streamable = streamable;
    });
    this.handleEvent = this.handleEvent.bind(this);
  }
  get state() {
    return super.state;
  }
  async getStreamable() {
    return new Promise((resolve) => {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          const hasVideo = devices.some((device) => device.kind === "videoinput");
          return resolve(hasVideo);
        });
      }
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
    });
  }
  async handleEvent(event) {
    if (event.type === this.confirmTypes.CLOSE_CONFIRM) {
      this.connection.close();
    }
    return super.handleEvent(event);
  }
  async sendEvent(event) {
    this.connection.send(event);
    return Promise.resolve();
  }
  async open() {
    await this.ensurePeerConnection();
    return super.open();
  }
  async close() {
    const confirm = await super.close();
    this.connection.close();
    return confirm;
  }
  async confirmClose(request) {
    const confirm = await super.confirmClose(request);
    return confirm;
  }
  async call() {
    return new Promise(async (resolve, reject) => {
      if (!this.state.open) {
        const metadata = { channelId: this.channelId };
        return Promise.reject(ChannelErrors.ChannelClosedError({ metadata }));
      }
      const requestEvent = new ChannelRequestEvent({
        type: this.requestTypes.CALL_REQUEST,
        data: {},
        metadata: { channelId: this.channelId }
      });
      const confirmEvent = await this.dispatchRequest(requestEvent);
      const address = _WebRTC.deriveAddress(this.peer.identifier);
      this.state.streams.local = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      this.state.call = _WebRTC.peerjs.call(address, this.state.local);
      this.state.call.on("stream", (remote) => {
        this.state.streams.remote = remote;
        resolve(confirmEvent);
      });
    });
  }
  async confirmCall(request) {
    if (!this.state.open) {
      const metadata = { channelId: this.channelId };
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata }));
    }
    return new Promise(async (resolve, reject) => {
      _WebRTC.peerjs.once("call", async (call) => {
        this.state.streams.local = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        if (!this.state.streams.local) {
          const metadata = { channelId: this.channelId };
          return Promise.reject(ChannelErrors.NoStreamsAvailableError({ metadata }));
        }
        const sealData = {
          type: request.type,
          timestamp: request.timestamp,
          metadata: request.metadata
        };
        const encrypted = await this.spark.cipher({ data: sealData, sharedKey: this.peer.sharedKey });
        const seal = await this.spark.signer({ data: encrypted });
        const confirmEvent = new ChannelConfirmEvent({
          type: this.confirmTypes.CALL_CONFIRM,
          metadata: { channelId: this.channelId },
          seal
        });
        await this.sendEvent(confirmEvent);
        call.on("stream", (stream) => {
          this.state.call = call;
          this.state.streams.remote = stream;
          resolve(confirmEvent);
        });
        call.answer(this.state.streams.local);
      });
    });
  }
  closeStreams() {
    this.state.call.close();
    this.state.streams.local.getTracks().forEach((track) => track.stop());
    this.state.streams.remote.getTracks().forEach((track) => track.stop());
    this.state.streams.local = null;
    this.state.streams.remote = null;
  }
  async hangup() {
    if (!this.state.open) {
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
    }
    const type = this.requestTypes.CLOSE_REQUEST;
    const metadata = { channelId: this.channelId };
    const data = {};
    const request = new ChannelRequestEvent({ type, metadata, data });
    const confirm = await this.dispatchRequest(request);
    this.closeStreams();
    return Promise.resolve(confirm);
  }
  async confirmHangup(request) {
    if (!this.state.open) {
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
    }
    const sealData = {
      type: request.type,
      timestamp: request.timestamp,
      metadata: request.metadata
    };
    const encrypted = await this.spark.cipher({ data: sealData, sharedKey: this.peer.sharedKey });
    const seal = await this.spark.signer({ data: encrypted });
    const confirm = new ChannelConfirmEvent({
      type: this.confirmTypes.CLOSE_CONFIRM,
      metadata: { channelId: this.channelId },
      seal
    });
    await this.sendEvent(confirm);
    this.closeStreams();
    return Promise.resolve(confirm);
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
