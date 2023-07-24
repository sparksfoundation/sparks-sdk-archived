import Peer, { DataConnection } from "peerjs";
import { WebRTCActions, WebRTCParams, WebRTCState } from "./types";
import { SparkChannel } from "../SparkChannel";
import { ChannelReceive, RequestParams, SparkChannelInterface } from "../SparkChannel/types";
import { ChannelErrors } from "../../errors";
import { SparkConfirmEvent, SparkEvent, SparkRequestEvent } from "../../events/SparkEvent";
import { RequestOptions } from "https";
import { ChannelEvents, ReceiptTypes } from "../SparkChannel/events";

const iceServers = [
  { urls: "stun:stun.relay.metered.ca:80" },
  { urls: "turn:a.relay.metered.ca:80", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
  { urls: "turn:a.relay.metered.ca:80?transport=tcp", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
  { urls: "turn:a.relay.metered.ca:443", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
  { urls: "turn:a.relay.metered.ca:443?transport=tcp", username: "6512f3d9d3dcedc7d4f2fc2f", credential: "PqVetG0J+Kn//OUc" },
];

export class WebRTC extends SparkChannel implements SparkChannelInterface<WebRTCActions> {
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
      const error = ChannelErrors.CHANNEL_NO_STREAMS_AVAILABLE_ERROR({ metadata });
      return Promise.reject(error);
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
        const error = ChannelErrors.CHANNEL_REQUEST_TIMEOUT_ERROR({ metadata: { channelId: this.channelId } });
        reject(error);
      }, 5000);
    });
  }

  public async sendEvent(event: SparkEvent) {
    this.connection.send(event);
    return Promise.resolve();
  }

  public async open(params?: RequestParams, options?: RequestOptions) {
    await this.ensurePeerConnection();
    return await super.open(params, options);
  }

  public async onCloseRequested(request: SparkRequestEvent): Promise<void> {
    await super.onCloseRequested(request);
    setTimeout(() => {
      this.closeStreams();
      this.connection.close()
    }, 200);
  }

  public async onCloseConfirmed(confirm: SparkConfirmEvent): Promise<void> {
    await super.onCloseConfirmed(confirm);
    setTimeout(() => {
      this.closeStreams();
      this.connection.close();
    }, 200);
  }

  public async call(params?: RequestParams, options?: RequestOptions): Promise<SparkConfirmEvent> {
    if (!this.state.open) {
      throw ChannelErrors.CHANNEL_CLOSED_ERROR({ metadata: { channelId: this.channelId } });
    }

    const request = ChannelEvents.CALL_REQUEST({
      metadata: { channelId: this.channelId },
      data: { ...params?.data }
    });

    return this.dispatchRequest(request, options);
  }

  public async handleCallRequest(request: SparkRequestEvent): Promise<void> {
    return Promise.resolve();
  }

  public async onCallRequested(request: SparkRequestEvent): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const address = WebRTC.deriveAddress(this.peer.identifier);
      this.state.streams.local = await this.getLocalStream();
      if (this.state.streams.local === null) return;
      const local: MediaStream = this.state.streams.local;

      this.handleCallRequest(request)
        .then(() => {
          WebRTC.peerjs.once('call', async call => {
            call.on('stream', (stream) => {
              this.state.call = call;
              this.state.streams.remote = stream;
              resolve();
            });

            if (call.peer !== address) return;
            call.answer(local);
          });
          this.confirmCall(request);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public async onCallConfirmed(confirm: SparkConfirmEvent): Promise<void> {
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

  public async confirmCall(request: SparkRequestEvent) {
    if (!this.state.open) {
      throw ChannelErrors.CHANNEL_CLOSED_ERROR({ metadata: { channelId: this.channelId } });
    }

    const receiptData: ReceiptTypes['CALL_REQUEST'] = {
      type: 'CALL_REQUEST',
      timestamp: request.timestamp,
      metadata: { eventId: request.metadata.eventId, channelId: this.channelId },
    }

    const receipt = await this._spark.signer.seal({ data: receiptData });

    const confirm = ChannelEvents.CALL_CONFIRM<typeof receiptData>({
      metadata: { channelId: this.channelId },
      data: { receipt },
    });

    return await this.sendEvent(confirm);
  }

  private closeStreams() {
    if (this.state.call) this.state.call.close();
    if (this.state.streams.local) this.state.streams.local.getTracks().forEach(track => track.stop());
    if (this.state.streams.remote) this.state.streams.remote.getTracks().forEach(track => track.stop());
    this.state.streams.local = null;
    this.state.streams.remote = null;
    this.state.call = null;
  }

  public async hangup(params?: RequestParams, options?: RequestOptions): Promise<SparkConfirmEvent> {
    if (!this.state.open) {
      throw ChannelErrors.CHANNEL_CLOSED_ERROR({ metadata: { channelId: this.channelId } });
    }

    const request = ChannelEvents.HANGUP_REQUEST({
      metadata: { channelId: this.channelId },
      data: { ...params?.data }
    });

    return this.dispatchRequest(request, options);
  }

  public async confirmHangup(request: SparkRequestEvent) {
    if (!this.state.open) {
      throw ChannelErrors.CHANNEL_CLOSED_ERROR({ metadata: { channelId: this.channelId } });
    }

    const receiptData: ReceiptTypes['HANGUP_REQUEST'] = {
      type: 'HANGUP_REQUEST',
      timestamp: request.timestamp,
      metadata: { eventId: request.metadata.eventId, channelId: this.channelId },
    }

    const receipt = await this._spark.signer.seal({ data: receiptData });

    const confirm = ChannelEvents.HANGUP_CONFIRM<typeof receiptData>({
      metadata: { channelId: this.channelId },
      data: { receipt },
    });

    return this.sendEvent(confirm);
  }

  public async onHangupRequested(request: SparkRequestEvent) {
    await this.confirmHangup(request);
    this.closeStreams();
  }

  public async onHangupConfirmed(confirm: SparkConfirmEvent) {
    this.closeStreams();
  }

  protected static peerjs: Peer;
  
  protected static deriveAddress(identifier?: string) {
    if (!identifier) throw new Error('Cannot derive address from empty identifier');
    return identifier.replace(/[^a-zA-Z0-9]/g, '');
  }

  public static receive: ChannelReceive = (callback, options) => {
    const { spark } = options;
    const ourAddress = WebRTC.deriveAddress(spark.identifier);

    WebRTC.peerjs = WebRTC.peerjs || new Peer(ourAddress, { config: { iceServers } });
    WebRTC.peerjs.on('open', () => {

      const connectionListener = (connection: DataConnection) => {
        const dataListener = (event: any) => {
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

          const rejectOpen = () => {
            const error = ChannelErrors.CHANNEL_REJECT_OPEN_REQUEST_ERROR(event);
            connection.send(error);
            setTimeout(() => connection.close(), 200);
          }

          connection.off('data', dataListener);
          return callback({ event: event, confirmOpen, rejectOpen });
        }
        connection.on('data', dataListener);
      }
      WebRTC.peerjs.on('connection', connectionListener)
    })
  }
}