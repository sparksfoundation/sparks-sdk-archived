import { Channel } from './Channel.js';
import { ChannelTypes } from './types.js';

export class WebRTC extends Channel {
  protected peerConnection: RTCPeerConnection;
  protected dataChannel: RTCDataChannel;

  constructor({ configuration, ...args }) {
    super({ channelType: ChannelTypes.WEB_RTC, ...args });

    this.peerConnection = new RTCPeerConnection(configuration);

    // Set up data channel
    this.dataChannel = this.peerConnection.createDataChannel('channel');

    // Set up event handlers for data channel events
    this.dataChannel.onmessage = this.receiveMessage.bind(this);
  }

  protected receiveMessage(event) {
    // Handle incoming data channel messages
    // You can customize this method to parse data if needed
    const payload = JSON.parse(event.data);
    super.receiveMessage(payload);
  }

  protected sendMessage(payload) {
    // Send a message over the WebRTC data channel
    const message = JSON.stringify(payload);
    this.dataChannel.send(message);
  }

  static async receive(callback, { spark, configuration, Channel }) {
    const args = Channel.channelRequest({
      options: {
        spark,
        configuration
      },
    });
    if (args) callback(args);
  }
}
