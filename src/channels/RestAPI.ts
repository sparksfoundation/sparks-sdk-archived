import { Channel } from './Channel.js';
import { ChannelTypes } from './types.js';

export class RestAPI extends Channel {
  static promises: Map<string, any> = new Map();
  static receives: Map<string, any> = new Map();
  static eventHandler: Function;
  
  constructor({ ...args }: any) {
    super({ channelType: ChannelTypes.REST_API, ...args });
    this.receiveMessage = this.receiveMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    RestAPI.receives.set(this.channelId, this.receiveMessage);
  }

  protected async sendMessage(payload: any) {
    const { eventId } = payload;
    if (eventId) {
      const promise = RestAPI.promises.get(eventId);
      if (promise) promise.resolve(payload);
    }
  }

  static receive(callback, { spark }) {
    if (!spark || !callback) {
      throw new Error('missing required arguments: spark, callback');
    }

    RestAPI.eventHandler = async (payload) => {
      return new Promise((resolve, reject) => {
        const eventId = payload.eventId;
        const eventType = payload.eventType;
        const channelId = payload.channelId;

        if (!eventId || !eventType || !channelId) {
          return reject({ error: 'Invalid payload' });
        }

        RestAPI.promises.set(eventId, { resolve, reject });
        const receive = RestAPI.receives.get(channelId);
        if (receive) return receive(payload);

        if (eventType === 'open_request') {
          const args = Channel.channelRequest({
            payload,
            options: {
              spark,
            },
            channel: RestAPI,
          });

          if (args) return callback(args);
        }
      })
    };
  }
}
