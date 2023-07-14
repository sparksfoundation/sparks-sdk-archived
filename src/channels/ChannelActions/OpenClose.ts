import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "../ChannelEvent";
import { ChannelActionConfirm, ChannelActionRequest } from "./types";
import merge from 'lodash.merge';
import { CoreChannel } from "../CoreChannel";
import { ChannelAction } from "./ChannelAction";

type Actions = ['OPEN', 'CLOSE'];
const Actions = ['OPEN', 'CLOSE'] as const;

const Events = {
  OPEN_REQUEST: 'OPEN_REQUEST',
  OPEN_CONFIRM: 'OPEN_CONFIRM',
  OPEN_ERROR: 'OPEN_ERROR',
  CLOSE_REQUEST: 'CLOSE_REQUEST',
  CLOSE_CONFIRM: 'CLOSE_CONFIRM',
  CLOSE_ERROR: 'CLOSE_ERROR',
} as const;

export class OpenClose extends ChannelAction<Actions>{
  public readonly name = 'OPEN_CLOSE';
  public readonly actions = Actions as Actions;

  public setContext({ channel }: { channel: CoreChannel; }): void {
    this.channel = channel;
    this.channel.state.status = 'CLOSED';

    // deny all requests when channel is closed
    this.channel.requestPreflight((requestEvent) => {
      const type = requestEvent.type as string;
      const isAllowed = ['OPEN_REQUEST', 'CLOSE_REQUEST'].includes(type);
      const isClosed = this.channel.state.status === 'CLOSED';
      if (!isAllowed && isClosed) throw new Error('channel is closed');
    });

    // remove listeners when channel closes
    // whether we get confirmation or not
    this.channel.on([
      this.channel.eventTypes.CLOSE_CONFIRM,
      this.channel.errorTypes.REQUEST_TIMEOUT_ERROR,
    ], (event) => {
      const closeConfirmed = event.type === 'CLOSE_CONFIRM';
      const closeTimeout = event.type === 'REQUEST_TIMEOUT_ERROR' && event.metadata.eventType === 'CLOSE_REQUEST';
      if (closeConfirmed || closeTimeout) {
        this.channel.state.status = 'CLOSED';
        this.channel.removeAllListeners();
      }
    });
  }

  public OPEN_REQUEST: ChannelActionRequest = async (params) => {
    // init request event omitting eventId to auto-generate next ids
    const { eventId, ...meta } = params?.metadata || {}
    const request = new ChannelRequestEvent({ 
      type: Events.OPEN_REQUEST, 
      metadata: { ...meta, channelId: this.channel.channelId }, 
      data:  merge({}, params?.data, {
        peer: {
          identifier: this.channel.identifier,
          publicKeys: this.channel.publicKeys,
        }
      })
    });

    // dispatch request and await confirmation
    const confirmEvent = await this.channel.dispatchRequest(request) as ChannelConfirmEvent;

    // setup shared key and public keys
    await this.channel.setSharedKey(confirmEvent.data.peer.publicKeys.cipher);
    this.channel.peer.publicKeys = confirmEvent.data.peer.publicKeys;

    // set channel status to open
    this.channel.state.status = 'OPEN';

    // return confirmation event
    return confirmEvent;
  }

  public OPEN_CONFIRM: ChannelActionConfirm = async (requestEvent: ChannelRequestEvent) => {
    // setup shared key and public keys
    await this.channel.setSharedKey(requestEvent.data.peer.publicKeys.cipher);
    this.channel.peer.publicKeys = requestEvent.data.peer.publicKeys;

    // set channel status to open
    this.channel.state.status = 'OPEN';

    // init confirm event omitting eventId to auto-generate next ids
    const { eventId, ...meta } = requestEvent?.metadata || {}
    const confirmEvent = new ChannelConfirmEvent({
      type: Events.OPEN_CONFIRM,
      metadata: merge({}, meta),
      data: merge({}, requestEvent?.data, {
        peer: {
          identifier: this.channel.identifier,
          publicKeys: this.channel.publicKeys,
        }
      }),
    });

    // return confirmation event
    return Promise.resolve(confirmEvent);
  }

  public CLOSE_REQUEST: ChannelActionRequest = async (params) => {
    // init request event omitting eventId to auto-generate next ids
    const { eventId, ...meta } = params?.metadata || {}
    const request = new ChannelRequestEvent({ 
      type: Events.CLOSE_REQUEST, 
      metadata: { ...meta, channelId: this.channel.channelId },
      data: merge({}, params?.data)
    });

    // set status, 
    this.channel.state.status = 'CLOSED';

    // dispatch request and return confirmation promise
    return await this.channel.dispatchRequest(request) as ChannelConfirmEvent;
  }

  public CLOSE_CONFIRM: ChannelActionConfirm = async (requestEvent: ChannelRequestEvent) => {
    // set status,
    this.channel.state.status = 'CLOSED';

    // init confirm event omitting eventId to auto-generate next ids
    const { eventId, ...meta } = requestEvent?.metadata || {}
    const confirmEvent = new ChannelConfirmEvent({
      type: Events.CLOSE_CONFIRM,
      metadata: merge({}, meta),
      data: merge({}, requestEvent?.data),
    });

    await this.channel.sealEvent(confirmEvent);
    return Promise.resolve(confirmEvent);
  }
}