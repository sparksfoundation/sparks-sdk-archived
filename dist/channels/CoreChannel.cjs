"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreChannel = void 0;
var _cuid = _interopRequireDefault(require("cuid"));
var _channel = require("../errors/channel.cjs");
var _ChannelEmitter = require("./ChannelEmitter/index.cjs");
var _ChannelEvent = require("./ChannelEvent/index.cjs");
var _types = require("./types.cjs");
var _lodash = _interopRequireDefault(require("lodash.merge"));
var _toCase = _interopRequireDefault(require("to-case"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class CoreChannel extends _ChannelEmitter.ChannelEmitter {
  constructor(params) {
    super();
    this._eventTypes = {
      ANY_EVENT: "ANY_EVENT"
    };
    this._requestTypes = {
      ANY_REQUEST: "ANY_REQUEST"
    };
    this._confirmTypes = {
      ANY_CONFIRM: "ANY_CONFIRM"
    };
    this._errorTypes = {
      ANY_ERROR: "ANY_ERROR"
    };
    this.getRequestHandlerName = type => {
      const baseType = type.replace("_REQUEST", "").replace("_CONFIRM", "");
      const pascalCase = _toCase.default.pascal(baseType);
      return `on${pascalCase}Requested`;
    };
    this.getConfirmHandlerName = type => {
      const baseType = type.replace("_REQUEST", "").replace("_CONFIRM", "");
      const pascalCase = _toCase.default.pascal(baseType);
      return `on${pascalCase}Confirmed`;
    };
    this._channelId = params.channelId || (0, _cuid.default)();
    this._type = params.type;
    this._spark = params.spark;
    this._peer = params.peer || {};
    this._state = {
      open: false,
      ...(params.state || {})
    };
    this._settings = params.settings || {};
    this._eventLog = params.eventLog || [];
    const actions = (params?.actions || []).concat(_types.CoreChannelActions);
    for (const action of actions) {
      this._eventTypes[`${action}_REQUEST`] = `${action}_REQUEST`;
      this._eventTypes[`${action}_CONFIRM`] = `${action}_CONFIRM`;
      this._requestTypes[`${action}_REQUEST`] = `${action}_REQUEST`;
      this._confirmTypes[`${action}_CONFIRM`] = `${action}_CONFIRM`;
    }
    Object.keys(_channel.ChannelErrorType).forEach(key => {
      this._errorTypes[key] = _channel.ChannelErrorType[key];
    });
    const sendEvent = this.sendEvent.bind(this);
    this.sendEvent = async event => {
      await sendEvent(event);
      await this.logEvent(event, {
        request: true
      });
    };
    this.sendEvent = this.sendEvent.bind(this);
    this.handleEvent = this.handleEvent.bind(this);
  }
  get channelId() {
    return this._channelId;
  }
  get type() {
    return this._type;
  }
  get peer() {
    return this._peer;
  }
  get state() {
    return this._state;
  }
  get settings() {
    return this._settings;
  }
  get eventLog() {
    return this._eventLog;
  }
  get eventTypes() {
    return this._eventTypes;
  }
  get requestTypes() {
    return this._requestTypes;
  }
  get confirmTypes() {
    return this._confirmTypes;
  }
  get errorTypes() {
    return this._errorTypes;
  }
  get spark() {
    return this._spark;
  }
  async sendEvent(event) {}
  async handleEvent(params) {
    try {
      switch (true) {
        case this.requestTypes.hasOwnProperty(params.type):
          const request = new _ChannelEvent.ChannelRequestEvent(params);
          const requestHandler = this.getRequestHandlerName(request.type);
          await this.logEvent(request, {
            response: true
          });
          await this[requestHandler](request);
          this.emit(request.type, request);
          break;
        case this.confirmTypes.hasOwnProperty(params.type):
          const confirm = new _ChannelEvent.ChannelConfirmEvent(params);
          const confirmHandler = this.getConfirmHandlerName(confirm.type);
          await this.logEvent(confirm, {
            response: true
          });
          await this[confirmHandler](confirm);
          this.emit(confirm.type, confirm);
          break;
        case this.errorTypes.hasOwnProperty(params.type):
          throw new _channel.ChannelError(params);
        default:
          break;
      }
    } catch (error) {
      console.log("error handling event", error);
      if (error instanceof _channel.ChannelError) {
        this.emit(_channel.ChannelErrorType.HANDLE_EVENT_ERROR, error);
        return;
      }
      const eventType = params?.type || "UNKNOWN_EVENT_TYPE";
      const metadata = {
        channelId: this.channelId,
        eventType
      };
      const handleError = _channel.ChannelErrors.HandleEventError({
        metadata
      });
      this.emit(_channel.ChannelErrorType.HANDLE_EVENT_ERROR, handleError);
    }
  }
  async openEventData(data, signingKey) {
    if (!data) return data;
    const publicKey = signingKey || this.peer.publicKeys.signer;
    const opened = await this.spark.signer.open({
      signature: data,
      publicKey
    });
    const decrypted = await this.spark.cipher.decrypt({
      data: opened,
      sharedKey: this.peer.sharedKey
    });
    return decrypted;
  }
  async sealEventData(data, signingKey) {
    const encrypted = await this.spark.cipher.encrypt({
      data,
      sharedKey: this.peer.sharedKey
    });
    const seal = await this.spark.signer.seal({
      data: encrypted,
      signingKey
    });
    return seal;
  }
  async dispatchRequest(request, timeout = 5e3) {
    return new Promise(async (resolve, reject) => {
      const baseType = request.type.replace("_REQUEST", "");
      const confirmType = this.confirmTypes[`${baseType}_CONFIRM`];
      const isOpen = this.requestTypes.OPEN_REQUEST === request.type;
      if (!isOpen && !this.state.open) {
        return reject(_channel.ChannelErrors.ChannelClosedError({
          metadata: {
            channelId: this.channelId,
            eventType: request.type
          }
        }));
      }
      if (!confirmType) {
        return reject(_channel.ChannelErrors.InvalidEventTypeError({
          metadata: {
            channelId: this.channelId,
            eventType: request.type
          }
        }));
      }
      let timer;
      const listener = confirm => {
        clearTimeout(timer);
        resolve(confirm);
      };
      this.once(confirmType, listener);
      if (timeout) {
        timer = setTimeout(() => {
          clearTimeout(timer);
          this.off(confirmType, listener);
          const error = _channel.ChannelErrors.ConfirmTimeoutError({
            metadata: {
              channelId: this.channelId,
              eventType: request.type
            }
          });
          this.emit(error.type, error);
          reject(error);
        }, timeout);
      }
      this.sendEvent(request);
    });
  }
  async open(params = {}) {
    return new Promise(async (resolve, reject) => {
      const type = this.requestTypes.OPEN_REQUEST;
      const metadata = {
        ...params?.metadata,
        channelId: this.channelId
      };
      const data = {
        ...params?.data,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys
      };
      const request = new _ChannelEvent.ChannelRequestEvent({
        type,
        metadata,
        data
      });
      this.dispatchRequest(request, params.timeout).then(() => resolve(this)).catch(error => reject(error));
    });
  }
  async onOpenRequested(request) {
    this.state.open = true;
    this.peer.identifier = request.data.identifier;
    this.peer.publicKeys = {
      ...request.data.publicKeys
    };
    this.peer.sharedKey = await this.spark.cipher.generateSharedKey({
      publicKey: this.peer.publicKeys.cipher
    });
    await this.confirmOpen(request);
  }
  async confirmOpen(request) {
    const type = this.confirmTypes.OPEN_CONFIRM;
    const {
      eventId,
      channelId,
      ...meta
    } = request?.metadata;
    const metadata = {
      ...meta,
      channelId: this.channelId
    };
    const receipt = await this.sealEventData(request);
    const data = {
      ...request?.data,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
      receipt
    };
    const confirm = new _ChannelEvent.ChannelConfirmEvent({
      type,
      metadata,
      data
    });
    this.sendEvent(confirm);
  }
  async onOpenConfirmed(confirm) {
    this.peer.identifier = confirm.data.identifier;
    this.peer.publicKeys = {
      ...confirm.data.publicKeys
    };
    this.peer.sharedKey = await this.spark.cipher.generateSharedKey({
      publicKey: this.peer.publicKeys.cipher
    });
    this.state.open = true;
  }
  async close(params = {}) {
    return new Promise(async (resolve, reject) => {
      const type = this.requestTypes.CLOSE_REQUEST;
      const metadata = {
        ...params.metadata,
        channelId: this.channelId
      };
      const data = {
        ...params.data
      };
      const request = new _ChannelEvent.ChannelRequestEvent({
        type,
        metadata,
        data
      });
      this.dispatchRequest(request, params.timeout).then(confirm => {
        resolve(confirm);
      }).catch(error => {
        this.onCloseConfirmed(null);
        reject(error);
      });
    });
  }
  async onCloseRequested(request) {
    await this.confirmClose(request);
    this.state.open = false;
    setTimeout(() => {
      this.removeAllListeners();
    }, 100);
  }
  async confirmClose(request) {
    if (!this.state.open) {
      throw _channel.ChannelErrors.ChannelClosedError({
        metadata: {
          channelId: this.channelId
        }
      });
    }
    const type = this.confirmTypes.CLOSE_CONFIRM;
    const {
      eventId,
      channelId,
      ...meta
    } = request?.metadata;
    const metadata = {
      ...meta,
      channelId: this.channelId
    };
    const receipt = await this.sealEventData(request);
    const data = {
      ...request?.data,
      receipt
    };
    const confirm = new _ChannelEvent.ChannelConfirmEvent({
      type,
      metadata,
      data
    });
    await this.sendEvent(confirm);
  }
  async onCloseConfirmed(confirm) {
    this.state.open = false;
    setTimeout(() => {
      this.removeAllListeners();
    }, 100);
  }
  async message(message, options = {}) {
    return new Promise(async (resolve, reject) => {
      const type = this.requestTypes.MESSAGE_REQUEST;
      const metadata = {
        channelId: this.channelId
      };
      const seal = await this.sealEventData(message);
      const request = new _ChannelEvent.ChannelRequestEvent({
        type,
        metadata,
        seal
      });
      const confirm = await this.dispatchRequest(request, options.timeout);
      return resolve(confirm);
    });
  }
  async onMessageRequested(request) {
    await this.confirmMessage(request);
  }
  async confirmMessage(request) {
    if (!this.state.open) {
      throw _channel.ChannelErrors.ChannelClosedError({
        metadata: {
          channelId: this.channelId
        }
      });
    }
    const type = this.confirmTypes.MESSAGE_CONFIRM;
    const {
      eventId,
      channelId,
      ...meta
    } = request?.metadata;
    const metadata = {
      ...meta,
      channelId: this.channelId
    };
    const data = await this.openEventData(request.seal);
    const receipt = await this.sealEventData({
      ...request,
      data
    });
    const confirm = new _ChannelEvent.ChannelConfirmEvent({
      type,
      metadata,
      data: {
        receipt
      }
    });
    this.sendEvent(confirm);
  }
  async onMessageConfirmed(confirm) {
    return Promise.resolve();
  }
  export() {
    return {
      channelId: this.channelId,
      type: this.type,
      peer: this.peer,
      settings: this.settings,
      eventLog: this.eventLog
    };
  }
  async import(data) {
    this._channelId = data.channelId || this.channelId;
    this._peer = (0, _lodash.default)(this.peer, data.peer || {});
    this._settings = (0, _lodash.default)(this.settings, data.settings || {});
    const eventLog = [...this._eventLog, ...data.eventLog].filter((event, index, self) => self.findIndex(e => e.metadata.eventId === event.metadata.eventId) === index).sort((a, b) => {
      if (a.timestamp < b.timestamp) return -1;
      if (a.timestamp > b.timestamp) return 1;
      return 0;
    });
    this._eventLog = [...eventLog];
    return Promise.resolve();
  }
  async logEvent(event, {
    request = void 0,
    response = void 0
  } = {}) {
    if (!event.data && !!event.seal) {
      const publicKey = request ? this.spark.publicKeys.signer : this.peer.publicKeys.signer;
      const data = await this.openEventData(event.seal, publicKey);
      this.eventLog.push({
        ...event,
        data,
        request,
        response
      });
    } else {
      this._eventLog.push({
        ...event,
        request,
        response
      });
    }
  }
}
exports.CoreChannel = CoreChannel;