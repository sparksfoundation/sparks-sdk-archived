import { Channel } from './Channel.js';
import { ChannelTypes } from './types.js';
const payload_callbacks = new Map();
const reply_callbacks = new Map();

export class Fastify extends Channel {
  protected payload_callbacks: any;
  protected reply_callbacks: any;

  constructor({ fastify, payload_callbacks, reply_callbacks, ...args }) {
    super({ channelType: ChannelTypes.FASTIFY, ...args });
    this.recieveMessage = this.recieveMessage.bind(this);
    payload_callbacks;
    reply_callbacks;
  }

  protected async sendMessage(payload: any) {
    const { eventId } = payload;
    if (!eventId) return
    console.log(eventId, 'asdfasdf')
    console.log(reply_callbacks, 'reply_callbacks asdfasdf')
    console.log(payload_callbacks, 'payload_callbacks asdfasdf')
    if (reply_callbacks.has(eventId)) {
      const callback = reply_callbacks.get(eventId);
      if (callback) callback.code(200).send(payload);
      reply_callbacks.delete(eventId);
    } else {
      payload_callbacks.set(eventId, payload);
    }
  }

  protected recieveMessage(payload: any) {
    console.log('recieveMessage', payload)
  }

  static receive(callback, { spark, fastify }) {
    if (!fastify) {
      throw new Error('Fastify instance not provided');
    }

    fastify.post('/channel', async (request, reply) => {
      const payload = request.body;
      const eventId = payload.eventId;
      const eventType = payload.eventType;
      const replyPayload = payload_callbacks.get(eventId);

      console.log(eventId, 'qwer')
      console.log(reply_callbacks, 'reply_callbacks qwer')
      console.log(payload_callbacks, 'payload_callbacks qwer')

      if (replyPayload) {
        reply.code(200).send(replyPayload);
      } else {
        reply_callbacks.set(eventId, reply);
      }

      if (eventType !== 'open_request') {
        return;
      }

      const args = Channel.channelRequest({
        payload,
        options: {
          spark,
          fastify,
          payload_callbacks,
          reply_callbacks,
        },
        channel: Fastify,
      });

      if (request) callback(args);
    });
  }
}
