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
  static _getEventId() {
    const eventId = this._nextEventId;
    this._nextEventId = cuid();
    return eventId;
  }
  constructor({
    type,
    data,
    sealed = false,
    metadata
  }) {
    this.type = type;
    this.sealed = sealed;
    this.data = data;
    this.timestamp = getUtcEpochTimestamp();
    this.metadata = {
      ...metadata,
      channelId: metadata.channelId,
      eventId: metadata.eventId || (metadata.nextEventId || _ChannelEvent._getEventId()),
      nextEventId: metadata.nextEventId || _ChannelEvent._getEventId()
    };
    Object.defineProperties(this, {
      _nextEventId: { enumerable: false, writable: true },
      _getEventId: { enumerable: false, writable: false },
      _data: { enumerable: false, writable: true },
      _sealed: { enumerable: false, writable: true }
    });
  }
  async seal({ cipher, signer, sharedKey }) {
    if (this.sealed)
      return this;
    const data = await cipher.encrypt({ data: this.data, sharedKey });
    const sealed = await signer.seal({ data });
    this.sealed = true;
    this.data = sealed;
    return this;
  }
  async open({ cipher, signer, publicKey, sharedKey }) {
    if (!this.sealed)
      return this;
    const data = await signer.open({ signature: this.data, publicKey });
    const opened = await cipher.decrypt({ data, sharedKey });
    this.sealed = false;
    this.data = opened;
    return this;
  }
};
export let ChannelEvent = _ChannelEvent;
ChannelEvent._nextEventId = cuid();
export class ChannelRequestEvent extends ChannelEvent {
  constructor({ type, data, sealed, metadata }) {
    super({ type, data, sealed, metadata });
  }
}
export class ChannelConfirmEvent extends ChannelEvent {
  constructor({ type, data, sealed, metadata }) {
    super({ type, data, sealed, metadata });
  }
}
