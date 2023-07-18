import { ChannelErrors } from "../../../errors/channel";
import { CoreChannel } from "../../CoreChannel";
import { ChannelReceive, CoreChannelActions, CoreChannelInterface } from "../../types";
import { HttpRestParams } from "./types";

export class HttpRest extends CoreChannel implements CoreChannelInterface<CoreChannelActions> {

  constructor({ peer, ...params }: HttpRestParams) {
    const type = 'HttpRest';
    super({ ...params, type, peer });
    this.peer.origin = peer.origin;
  }

  public static requestHandler;
  public static channels: Map<string, HttpRest> = new Map();
  public static receive: ChannelReceive = (callback, options) => {
    HttpRest.requestHandler = async (event) => {
      return new Promise(async (resolveRequest, rejectRequest) => {
        const { type, data, metadata } = event;
        const { eventId, nextEventId, channelId } = metadata;

        if (!eventId || !channelId || !type) {
          const error = ChannelErrors.InvalidEventTypeError({ metadata });
          return rejectRequest(error);
        }

        if (type !== 'OPEN_REQUEST') {
          const channel = HttpRest.channels.get(metadata.channelId);
          if (!channel) {
            const error = ChannelErrors.ChannelNotFoundError({ metadata });
            return rejectRequest(error);
          }

          channel.sendEvent = async (event) => {
            resolveRequest(event);
          };

          channel.handleEvent(event);
          return; 
        }

        const confirmOpen = () => {
          return new Promise<HttpRest>(async (resolveChannel, rejectChannel) => {

            const channel = new HttpRest({
              channelId: metadata.channelId,
              peer: { ...data.origin },
              spark: options.spark,
            });
  
            channel.on(channel.errorTypes.ANY_ERROR, async (event) => {
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
          const error = ChannelErrors.OpenRejectedError({
            metadata: { channelId: metadata.channelId },
            message: 'Channel rejected',
          });
          resolveRequest(event);
        }

        return callback({ event: event.data, confirmOpen, rejectOpen });
      });
    }
  }
}