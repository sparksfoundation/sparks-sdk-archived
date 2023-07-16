import cuid from "cuid";
function getUtcEpochTimestamp() {
  const data = /* @__PURE__ */ new Date();
  const utcTimestamp = Date.UTC(
    data.getUTCFullYear(),
    data.getUTCMonth(),
    data.getUTCDate(),
    data.getUTCHours(),
    data.getUTCMinutes(),
    data.getUTCSeconds(),
    data.getUTCMilliseconds()
  );
  return utcTimestamp;
}
const _ChannelEvent = class {
  constructor(params) {
    const { type, metadata, data = void 0, seal = void 0 } = params;
    this.type = type;
    this.data = data;
    this.seal = seal;
    this.timestamp = getUtcEpochTimestamp();
    const eventId = metadata.eventId && metadata.nextEventId ? metadata.eventId : _ChannelEvent._nextEventId;
    const nextEventId = metadata.eventId && metadata.nextEventId ? metadata.nextEventId : cuid();
    _ChannelEvent._nextEventId = nextEventId;
    this.metadata = {
      ...metadata,
      channelId: metadata.channelId,
      eventId,
      nextEventId
    };
  }
};
export let ChannelEvent = _ChannelEvent;
ChannelEvent._nextEventId = cuid();
export class ChannelRequestEvent extends ChannelEvent {
  constructor(params) {
    super(params);
    this.type = params.type;
  }
}
export class ChannelConfirmEvent extends ChannelEvent {
  constructor(params) {
    super(params);
    this.type = params.type;
  }
}
