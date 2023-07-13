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
  // public static _getEventIds(event) {
  //   const eventId = ChannelEvent._nextEventId;
  //   const nextEventId = cuid();
  //   ChannelEvent._nextEventId = nextEventId;
  //   return { eventId, nextEventId };
  // }
  constructor({
    type,
    data,
    seal,
    metadata
  }) {
    this.type = type;
    this.seal = seal;
    this.data = data;
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
  async sealData({ cipher, signer, sharedKey }) {
    if (this.seal)
      return this;
    const data = await cipher.encrypt({ data: this.data, sharedKey });
    this.seal = await signer.seal({ data });
    this.data = void 0;
    return this;
  }
  async openData({ cipher, signer, publicKey, sharedKey }) {
    if (!this.seal)
      return this;
    const data = await signer.open({ signature: this.seal, publicKey });
    const opened = await cipher.decrypt({ data, sharedKey });
    this.data = opened;
    return this;
  }
};
export let ChannelEvent = _ChannelEvent;
ChannelEvent._nextEventId = cuid();
export class ChannelRequestEvent extends ChannelEvent {
  constructor({ type, data, seal, metadata }) {
    super({ type, data, seal, metadata });
  }
}
export class ChannelConfirmEvent extends ChannelEvent {
  constructor({ type, data, seal, metadata }) {
    super({ type, data, seal, metadata });
  }
}
