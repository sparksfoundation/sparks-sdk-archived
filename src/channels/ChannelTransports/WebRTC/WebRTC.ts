import Peer, { DataConnection } from "peerjs";
import { ChannelConfirmEvent, ChannelRequestEvent } from "../../ChannelEvent";
import { ChannelEventParams } from "../../ChannelEvent/types";
import { CoreChannel } from "../../CoreChannel";
import { ChannelReceive, ChannelRequestParams, CoreChannelInterface } from "../../types";
import { WebRTCActions, WebRTCParams, WebRTCState } from "./types";
import { ChannelErrors } from "../../../errors/channel";

const iceServers = [
  { urls: "stun:stun.relay.metered.ca:80" },
  { urls: "turn:a.relay.metered.ca:80", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
  { urls: "turn:a.relay.metered.ca:80?transport=tcp", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
  { urls: "turn:a.relay.metered.ca:443", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
  { urls: "turn:a.relay.metered.ca:443?transport=tcp", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
];

export class WebRTC extends CoreChannel implements CoreChannelInterface<WebRTCActions> {
  private connection: DataConnection;

  public get state(): WebRTCState {
    return super.state as WebRTCState;
  }

  constructor({ connection, ...params }: WebRTCParams) {
    const type = 'WebRTC';
    super({ ...params, type, actions: [...WebRTCActions] });

    this.state.streamable = null;
    this.state.call = null;
    this.state.streams = {
      local: null,
      remote: null,
    };

    if (connection) {
      this.connection = connection;
      this.connection.on('data', this.handleEvent);
    }

    this.setStreamable();
    this.handleEvent = this.handleEvent.bind(this);

    window.addEventListener('beforeunload', async () => {
      await this.hangup();
      await this.close();
    });
  }

  public async setStreamable(): Promise<boolean> {
    return new Promise((resolve) => {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices()
          .then((devices) => {
            const hasVideo = devices.some((device) => device.kind === 'videoinput');
            this.state.streamable = hasVideo;
            return resolve(hasVideo);
          })
      }
    });
  }

  public async getLocalStream(): Promise<MediaStream> {
    if (!this.state.streamable) {
      const metadata = { channelId: this.channelId };
      return Promise.reject(ChannelErrors.NoStreamsAvailableError({ metadata }));
    }

    if (this.state.streams.local) {
      return Promise.resolve(this.state.streams.local);
    }

    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  }

  private async ensurePeerConnection(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.connection && this.connection.open) {
        return resolve();
      }
      const address = WebRTC.deriveAddress(this.peer.identifier);
      const connection = WebRTC.peerjs.connect(address, { reliable: true });
      connection.on('open', () => {
        this.connection = connection;
        this.connection.on('data', this.handleEvent);
        resolve();
      });

      setTimeout(() => {
        if (connection.open) return;
        reject(ChannelErrors.ConfirmTimeoutError({ metadata: { channelId: this.channelId } }));
      }, 5000);
    });
  }

  public async handleEvent(event: ChannelEventParams) {
    console.log('handleEvent', event.type)
    return super.handleEvent(event);
  }

  public async sendEvent(event: ChannelEventParams) {
    console.log('sendEvent', event.type)
    this.connection.send(event);
    return Promise.resolve();
  }

  public async open() {
    await this.ensurePeerConnection();
    return await super.open();
  }

  public async onCloseRequested(request: ChannelRequestEvent): Promise<void> {
    await super.onCloseRequested(request);
    setTimeout(() => {
      this.connection.close()
    }, 200);
  }

  public async onCloseConfirmed(confirm: ChannelConfirmEvent): Promise<void> {
    await super.onCloseConfirmed(confirm);
    setTimeout(() => {
      this.connection.close();
    }, 200);
  }

  public async call(): Promise<ChannelConfirmEvent> {
    const requestEvent = new ChannelRequestEvent({
      type: this.requestTypes.CALL_REQUEST,
      data: { identifier: this.spark.identifier },
      metadata: { channelId: this.channelId },
    });
    const confirmEvent = await this.dispatchRequest(requestEvent, 10000);
    return confirmEvent;
  }

  public async handleCallRequest(request: ChannelRequestEvent) {
    return Promise.resolve();
  }
  public async onCallRequested(request: ChannelRequestEvent) {
    return new Promise<void>(async (resolve, reject) => {
      const address = WebRTC.deriveAddress(this.peer.identifier);
      this.state.streams.local = await this.getLocalStream();
      this.handleCallRequest(request)
        .then(() => {
          WebRTC.peerjs.once('call', async call => {
            call.on('stream', (stream) => {
              this.state.call = call;
              this.state.streams.remote = stream;
              resolve();
            });

            if (call.peer !== address) return;
            call.answer(this.state.streams.local);
          });
          this.confirmCall(request);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public async onCallConfirmed(confirm: ChannelConfirmEvent): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const address = WebRTC.deriveAddress(this.peer.identifier);
      this.state.streams.local = await this.getLocalStream();
      this.state.call = WebRTC.peerjs.call(address, this.state.streams.local);
      this.state.call.on('stream', (remote) => {
        this.state.streams.remote = remote;
        resolve();
      });
    })
  }

  public async confirmCall(request: ChannelRequestEvent) {
    if (!this.state.open) {
      const metadata = { channelId: this.channelId };
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata }));
    }
    const receipt = await this.sealEventData(request);
    const confirmEvent = new ChannelConfirmEvent({
      type: this.confirmTypes.CALL_CONFIRM,
      metadata: { channelId: this.channelId },
      data: { identifier: this.spark.identifier, receipt },
    });

    await this.sendEvent(confirmEvent as ChannelConfirmEvent);
  }

  private closeStreams() {
    this.state.call.close();
    this.state.streams.local.getTracks().forEach(track => track.stop());
    this.state.streams.remote.getTracks().forEach(track => track.stop());
    this.state.streams.local = null;
    this.state.streams.remote = null;
    this.state.call = null;
  }

  public async hangup(params: ChannelRequestParams = {}): Promise<ChannelConfirmEvent> {
    return new Promise(async (resolve, reject) => {
      if (!this.state.open) {
        return reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
      }
      const type = this.requestTypes.HANGUP_REQUEST;
      const metadata = { channelId: this.channelId };
      const data = {};
      const request = new ChannelRequestEvent({ type, metadata, data });
      this.dispatchRequest(request, params.timeout)
        .then((confirm) => { resolve(confirm) })
        .catch((error) => {
          this.onHangupConfirmed(null);
          reject(error);
        });
    });
  }

  public async confirmHangup(request: ChannelRequestEvent) {
    if (!this.state.open) {
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
    }
    const receipt = await this.sealEventData(request);
    const confirm = new ChannelConfirmEvent({
      type: this.confirmTypes.HANGUP_CONFIRM,
      metadata: { channelId: this.channelId },
      data: { receipt },
    });
    this.sendEvent(confirm as ChannelConfirmEvent);
  }

  public async onHangupRequested(request: ChannelRequestEvent) {
    await this.confirmHangup(request);
    this.closeStreams();
  }

  public async onHangupConfirmed(confirm: ChannelConfirmEvent) {
    this.closeStreams();
  }

  protected static peerjs: Peer;
  protected static deriveAddress(identifier: string) {
    return identifier.replace(/[^a-zA-Z0-9]/g, '');
  }

  public static receive: ChannelReceive = (callback, options) => {
    const { spark } = options;
    const ourAddress = WebRTC.deriveAddress(spark.identifier);

    WebRTC.peerjs = WebRTC.peerjs || new Peer(ourAddress, { config: { iceServers } });
    WebRTC.peerjs.on('open', () => {

      const connectionListener = connection => {
        const dataListener = (event) => {
          const { type, data, metadata } = event;
          if (type !== 'OPEN_REQUEST') return;

          const confirmOpen = () => {
            return new Promise<WebRTC>(async (resolve, reject) => {
              const channel = new WebRTC({
                channelId: metadata.channelId,
                peer: { ...data.peer },
                connection,
                spark: spark,
              });

              channel.on(channel.eventTypes.ANY_ERROR, async (event) => {
                return reject(event);
              });

              await channel.handleEvent(event)
              return resolve(channel);
            });
          }

          connection.off('data', dataListener);
          return callback({ event: event, confirmOpen });
        }
        connection.on('data', dataListener);
      }
      WebRTC.peerjs.on('connection', connectionListener)
    })
  }
}