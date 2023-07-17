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
export class ChannelEvent {
  constructor(params) {
    const { type, metadata, data = void 0, seal = void 0 } = params;
    this.type = type;
    this.data = data;
    this.seal = seal;
    this.timestamp = getUtcEpochTimestamp();
    this.metadata = {
      ...metadata,
      channelId: metadata.channelId,
      eventId: metadata.eventId || cuid()
    };
  }
}
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
