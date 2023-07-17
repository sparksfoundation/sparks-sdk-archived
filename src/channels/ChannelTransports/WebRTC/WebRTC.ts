import Peer, { DataConnection } from "peerjs";
import { ChannelConfirmEvent, ChannelRequestEvent } from "../../ChannelEvent";
import { ChannelEventParams } from "../../ChannelEvent/types";
import { CoreChannel } from "../../CoreChannel";
import { ChannelReceive, CoreChannelInterface } from "../../types";
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
    super({ ...params, type, actions: [ ...WebRTCActions ] });

    this.state.streamable = null;
    this.state.streams = {
      call: null,
      local: null,
      remote: null,
    };

    if (connection) {
      this.connection = connection;
      this.connection.on('data', this.handleEvent);
    }

    this.setStreamable();
    this.handleEvent = this.handleEvent.bind(this);
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
    });
  }

  public async handleEvent(event: ChannelEventParams) {
    if (event.type === this.confirmTypes.CLOSE_CONFIRM) {
      this.connection.close();
    }
    return super.handleEvent(event);
  }

  public async sendEvent(event: ChannelEventParams) {
    this.connection.send(event);
    return Promise.resolve();
  }

  public async open(): Promise<ChannelConfirmEvent> {
    await this.ensurePeerConnection();
    return super.open();
  }

  public async close(): Promise<ChannelConfirmEvent> {
    const confirm = await super.close();
    this.connection.close();
    return confirm;
  }

  public async confirmClose(request: ChannelRequestEvent): Promise<ChannelConfirmEvent> {
    const confirm = await super.confirmClose(request);
    // normally we would close the connection here, but we need to wait for the
    // peerjs to emit the close event, it's unreliable to do it here so we do it
    // in the handleEvent method which gives assurance that the confirmation is in
    return confirm;
  }

  public async call(): Promise<ChannelConfirmEvent> {
    return new Promise<ChannelConfirmEvent>(async (resolve, reject) => {
      if (!this.state.open) {
        const metadata = { channelId: this.channelId };
        return Promise.reject(ChannelErrors.ChannelClosedError({ metadata }));
      }
  
      const requestEvent = new ChannelRequestEvent({
        type: this.requestTypes.CALL_REQUEST,
        data: {},
        metadata: { channelId: this.channelId },
      });
      
      const confirmEvent = await this.dispatchRequest(requestEvent)
      
      // we have permission to call, so we call
      const address = WebRTC.deriveAddress(this.peer.identifier);
  
      this.state.streams.local = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true,
      });
  
      this.state.call = WebRTC.peerjs.call(address, this.state.streams.local);
  
      this.state.call.on('stream', (remote) => {
        this.state.streams.remote = remote;
        resolve(confirmEvent);
      });
    });
  }

  public async confirmCall(request: ChannelRequestEvent): Promise<ChannelConfirmEvent> {
    if (!this.state.open) {
      const metadata = { channelId: this.channelId };
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata }));
    }

    // todo - handle accepting or rejecting the call via popup
    // if this.acceptCall() or something

    this.state.streams.local = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (!this.state.streams.local) {
      const metadata = { channelId: this.channelId };
      return Promise.reject(ChannelErrors.NoStreamsAvailableError({ metadata }));
    }

    const sealData = {
      type: request.type,
      timestamp: request.timestamp,
      metadata: request.metadata,
    };

    const encrypted = await this.spark.cipher.encrypt({ data: sealData, sharedKey: this.peer.sharedKey });
    const seal = await this.spark.signer.seal({ data: encrypted });

    const confirmEvent = new ChannelConfirmEvent({
      type: this.confirmTypes.CALL_CONFIRM,
      metadata: { channelId: this.channelId },
      seal,
    });

    await this.sendEvent(confirmEvent as ChannelConfirmEvent);

    WebRTC.peerjs.once('call', async call => {
      call.on('stream', (stream) => {
        this.state.call = call;
        this.state.streams.remote = stream;
      });

      call.answer(this.state.streams.local);
    });

    return Promise.resolve(confirmEvent);
  }

  private closeStreams() {
    this.state.call.close();
    this.state.streams.local.getTracks().forEach(track => track.stop());
    this.state.streams.remote.getTracks().forEach(track => track.stop());
    this.state.streams.local = null;
    this.state.streams.remote = null;
  }

  public async hangup(): Promise<ChannelConfirmEvent> {
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

  public async confirmHangup(request: ChannelRequestEvent): Promise<ChannelConfirmEvent> {
    if (!this.state.open) {
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
    }
    const sealData = {
      type: request.type,
      timestamp: request.timestamp,
      metadata: request.metadata,
    };

    const encrypted = await this.spark.cipher({ data: sealData, sharedKey: this.peer.sharedKey });
    const seal = await this.spark.signer({ data: encrypted });

    const confirm = new ChannelConfirmEvent({ 
      type: this.confirmTypes.CLOSE_CONFIRM, 
      metadata: { channelId: this.channelId }, 
      seal 
    });

    await this.sendEvent(confirm as ChannelConfirmEvent);
    this.closeStreams();
    
    return Promise.resolve(confirm);
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