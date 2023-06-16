import { Channel } from './Channel.js';
import { ChannelTypes } from './types.js';
const promises = new Map();
const receives = new Map();

export class Fastify extends Channel {

  constructor({ ...args }: any) {
    super({ channelType: ChannelTypes.FASTIFY, ...args });
    this.receiveMessage = this.receiveMessage.bind(this);
    receives.set(this.channelId, this.receiveMessage);
  }

  protected async sendMessage(payload: any) {
    const { eventId } = payload;
    if (eventId) {
      const promise = promises.get(eventId);
      if (promise) promise.resolve(payload);
    }
  }

  static receive(callback, { spark, fastify }) {
    if (!fastify) {
      throw new Error('Fastify instance not provided');
    }

    fastify.post('/channel', (request, reply) => {
      const payload = request.body;
      const eventId = payload.eventId;
      const eventType = payload.eventType;
      const channelId = payload.channelId;
      
      if (!eventId || !eventType || !channelId) {
        reply.code(400).send('Invalid payload');
      }

      return new Promise((resolve, reject) => {
        promises.set(eventId, { resolve, reject });
        const receive = receives.get(channelId);

        if (eventType === 'open_request') {
          const args = Channel.channelRequest({
            payload,
            options: {
              spark,
            },
            channel: Fastify,
          });
          if (args) callback(args);
          return
        }
        
        if (receive) return receive(payload);

        reply.code(404).send('unknown error');
      })
    });
  }
}
