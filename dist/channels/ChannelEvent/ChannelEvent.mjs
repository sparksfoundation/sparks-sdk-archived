import cuid from "cuid";
import { ChannelError } from "../../errors/channel.mjs";
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
export function eventFromResponse(payload) {
  if (payload instanceof ChannelEvent)
    return payload;
  if (payload instanceof ChannelError)
    return payload;
  const { type, sealed, metadata, data } = payload;
  if (!type || !metadata || !data)
    throw Error("invalid event");
  switch (true) {
    case type.endsWith("_REQUEST"):
      return new ChannelRequestEvent({ type, sealed, metadata, data });
    case type.endsWith("_CONFIRM"):
      return new ChannelConfirmEvent({ type, sealed, metadata, data });
    case type.endsWith("_ERROR"):
      return new ChannelError({ ...payload });
    default:
      throw Error("invalid event");
  }
}
export class ChannelEvent {
  constructor({
    type,
    data,
    sealed = false,
    metadata
  }) {
    this._nextEventId = cuid();
    this.type = type;
    this.sealed = sealed;
    this.data = data;
    this.timestamp = getUtcEpochTimestamp();
    this.metadata = {
      ...metadata,
      channelId: metadata.channelId,
      eventId: metadata.eventId || this._getEventId(),
      nextEventId: this._getEventId()
    };
    Object.defineProperties(this, {
      _nextEventId: { enumerable: false, writable: true },
      _getEventId: { enumerable: false, writable: false },
      _data: { enumerable: false, writable: true },
      _sealed: { enumerable: false, writable: true }
    });
  }
  _getEventId() {
    const eventId = this._nextEventId;
    this._nextEventId = cuid();
    return eventId;
  }
  async seal({ cipher, signer, sharedKey }) {
    if (this.sealed)
      return;
    const data = await cipher.encrypt({ data: this.data, sharedKey });
    const sealed = await signer.seal({ data });
    this.sealed = true;
    this.data = sealed;
    return this;
  }
  async open({ cipher, signer, publicKey, sharedKey }) {
    if (!this.sealed)
      return;
    const data = await signer.open({ signature: this.data, publicKey });
    const opened = await cipher.decrypt({ data, sharedKey });
    this.sealed = false;
    this.data = opened;
    return this;
  }
}
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
