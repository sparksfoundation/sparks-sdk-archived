"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChannelRequestEvent = exports.ChannelEvent = exports.ChannelConfirmEvent = void 0;
var _cuid = _interopRequireDefault(require("cuid"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function getUtcEpochTimestamp() {
  const data = /* @__PURE__ */new Date();
  const utcTimestamp = Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate(), data.getUTCHours(), data.getUTCMinutes(), data.getUTCSeconds(), data.getUTCMilliseconds());
  return utcTimestamp;
}
class ChannelEvent {
  constructor(params) {
    const {
      type,
      metadata,
      data = void 0,
      seal = void 0
    } = params;
    this.type = type;
    this.data = data;
    this.seal = seal;
    this.timestamp = getUtcEpochTimestamp();
    this.metadata = {
      ...metadata,
      channelId: metadata.channelId,
      eventId: metadata.eventId || (0, _cuid.default)()
    };
  }
}
exports.ChannelEvent = ChannelEvent;
class ChannelRequestEvent extends ChannelEvent {
  constructor(params) {
    super(params);
    this.type = params.type;
  }
}
exports.ChannelRequestEvent = ChannelRequestEvent;
class ChannelConfirmEvent extends ChannelEvent {
  constructor(params) {
    super(params);
    this.type = params.type;
  }
}
exports.ChannelConfirmEvent = ChannelConfirmEvent;