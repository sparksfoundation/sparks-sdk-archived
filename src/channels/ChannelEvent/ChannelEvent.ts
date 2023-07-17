import cuid from "cuid";
import { 
  ChannelEventInterface, ChannelEventRequestType, 
  ChannelEventConfirmType, ChannelEventParams
} from "./types";

function getUtcEpochTimestamp() {
  const data = new Date();
  const utcTimestamp = Date.UTC(
    data.getUTCFullYear(),
    data.getUTCMonth(),
    data.getUTCDate(),
    data.getUTCHours(),
    data.getUTCMinutes(),
    data.getUTCSeconds(),
    data.getUTCMilliseconds(),
  );
  return utcTimestamp;
}

export class ChannelEvent implements ChannelEventInterface {
  public readonly type: ChannelEventInterface['type'];
  public readonly timestamp: ChannelEventInterface['timestamp'];
  public readonly metadata: ChannelEventInterface['metadata'];
  public readonly data: ChannelEventInterface['data'];
  public readonly seal: ChannelEventInterface['seal'];
  constructor(params: ChannelEventParams) {
    const { type, metadata, data = undefined, seal = undefined } = params as any;

    this.type = type;
    this.data = data;
    this.seal = seal;
    this.timestamp = getUtcEpochTimestamp();

    this.metadata = {
      ...metadata,
      channelId: metadata.channelId,
      eventId: metadata.eventId || cuid(),
    };
  }
}

export class ChannelRequestEvent extends ChannelEvent {
  declare public readonly type: ChannelEventRequestType<any>;
  constructor(params: ChannelEventParams) {
    super(params);
    this.type = params.type as ChannelEventRequestType<any>;
  }
}

export class ChannelConfirmEvent extends ChannelEvent {
  declare public readonly type: ChannelEventConfirmType<any>;
  constructor(params: ChannelEventParams) {
    super(params);
    this.type = params.type as ChannelEventConfirmType<any>;
  }
}
