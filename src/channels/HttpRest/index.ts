import { ChannelErrors } from "../../errors";
import { SparkChannel } from "../SparkChannel";
import { ChannelReceive, SparkChannelActions, SparkChannelInterface } from "../SparkChannel/types";
import { HttpRestParams } from "./types";

export class HttpRest extends SparkChannel implements SparkChannelInterface<SparkChannelActions> {

  constructor({ peer, ...params }: HttpRestParams) {
    const type = 'HttpRest';
    super({ ...params, type, peer });
    this.peer.origin = peer.origin;
  }

  public async sendEvent(payload: any) {
    // no-op for HttpRest
  }

  public static requestHandler: (event: any) => Promise<any>;
  public static channels: Map<string, HttpRest> = new Map();

  public static receive: ChannelReceive = (callback, options) => {
    HttpRest.requestHandler = async (event) => {
      return new Promise(async (resolveRequest, rejectRequest) => {
        const { type, data, digest, metadata } = event || {};
        const { eventId, channelId } = metadata || {};
        const invalidEvent = !type || !(data || digest) || !metadata || !eventId || !channelId;
        if (invalidEvent) return rejectRequest();

        if (type !== 'OPEN_REQUEST') {
          const channel = HttpRest.channels.get(metadata.channelId);
          if (!channel) return rejectRequest();

          channel.sendEvent = async (event) => {
            resolveRequest(event);
          };

          return channel.handleEvent(event);
        }

        const confirmOpen = () => {
          return new Promise<HttpRest>(async (resolveChannel, rejectChannel) => {
            const channel = new HttpRest({
              channelId: metadata.channelId,
              peer: { ...data.origin },
              spark: options.spark,
            });
  
            channel.on(channel.eventTypes.ANY_ERROR, async (event) => {
              return rejectChannel(event);
            });
  
            channel.sendEvent = async (event) => {
              resolveRequest(event);
            };
  
            await channel.handleEvent(event);
            HttpRest.channels.set(channelId, channel);

            return resolveChannel(channel);
          });
        }

        const rejectOpen = () => {
          const error = ChannelErrors.CHANNEL_REJECT_OPEN_REQUEST_ERROR(event);
          resolveRequest(error);
        }

        return callback({ event: event.data, confirmOpen, rejectOpen });
      });
    }
  }
}