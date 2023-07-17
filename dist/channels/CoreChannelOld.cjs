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
    this._channelId = params.channelId || (0, _cuid.default)();
    this._type = params.type;
    this._spark = params.spark;
    this._peer = params.peer || {};
    this._state = {
      open: false,
      ...(params.state || {})
    };
    this._settings = {
      timeout: 1e4,
      ...(params.settings || {})
    };
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
    this.handleEvent = this.handleEvent.bind(this);
    this.sendEvent = this.sendEvent.bind(this);
  }
  get spark() {
    return this._spark;
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
  async logEvent(event, {
    request = void 0,
    response = void 0
  } = {}) {
    if (!event.data && !!event.seal) {
      const publicKey = request ? this.spark.publicKeys.signer : this.peer.publicKeys.signer;
      const opened = await this.spark.signer.open({
        signature: event.seal,
        publicKey
      });
      const decrypted = await this.spark.cipher.decrypt({
        data: opened,
        sharedKey: this.peer.sharedKey
      });
      this.eventLog.push({
        ...event,
        data: decrypted,
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
  requestMethodName(type) {
    const base = type.replace("_REQUEST", "").replace("_CONFIRM", "");
    const requestMethod = base.toLowerCase().replace(/_(.)/g, function (match, group1) {
      return group1.toUpperCase();
    });
    return requestMethod;
  }
  confirmMethodName(type) {
    const requestMethod = this.requestMethodName(type);
    const confirmMethod = `confirm${requestMethod.charAt(0).toUpperCase() + requestMethod.slice(1)}`;
    return confirmMethod;
  }
  confirmTypeFromType(type) {
    const base = type.replace("_REQUEST", "").replace("_CONFIRM", "");
    const confirmType = `${base}_CONFIRM`;
    return this.confirmTypes[confirmType];
  }
  async dispatchRequest(request) {
    return new Promise(async (resolve, reject) => {
      try {
        let timer;
        const confirmType = this.confirmTypeFromType(request.type);
        const onConfirmed = async confirm => {
          clearTimeout(timer);
          return resolve(confirm);
        };
        const onTimeout = () => {
          clearTimeout(timer);
          const timeoutError = _channel.ChannelErrors.ConfirmTimeoutError({
            metadata: {
              channelId: this.channelId,
              eventType: request.type
            }
          });
          this.emit(_channel.ChannelErrorType.CONFIRM_TIMEOUT_ERROR, timeoutError);
          return reject(timeoutError);
        };
        if (this.settings.timeout) {
          timer = setTimeout(onTimeout, this.settings.timeout);
        }
        this.once(confirmType, onConfirmed);
        await this.logEvent(request, {
          request: true
        });
        await this.sendEvent(request);
      } catch (error) {
        console.log(error);
        const eventType = request?.type || "UNKNOWN_EVENT_TYPE";
        const channelError = error instanceof _channel.ChannelError ? error : _channel.ChannelErrors.DispatchRequestError({
          metadata: {
            channelId: this.channelId,
            eventType
          }
        });
        this.emit(_channel.ChannelErrorType.DISPATCH_REQUEST_ERROR, channelError);
        reject(channelError);
      }
    });
  }
  async handleEvent(params) {
    return new Promise(async (resolve, reject) => {
      try {
        switch (true) {
          case this.requestTypes.hasOwnProperty(params.type):
            const requestEvent = new _ChannelEvent.ChannelRequestEvent(params);
            await this.logEvent(requestEvent, {
              response: true
            });
            const confirmType = this.confirmTypes[requestEvent.type.replace("_REQUEST", "_CONFIRM")];
            const confirmMethod = this.confirmMethodName(confirmType);
            await this[confirmMethod](requestEvent);
            this.emit(requestEvent.type, requestEvent);
            return resolve();
          case this.confirmTypes.hasOwnProperty(params.type):
            const confirmEvent = new _ChannelEvent.ChannelConfirmEvent(params);
            await this.logEvent(confirmEvent, {
              response: true
            });
            this.emit(confirmEvent.type, confirmEvent);
            return resolve();
          case this.errorTypes.hasOwnProperty(params.type):
            const error = new _channel.ChannelError(params);
            throw error;
          default:
            return;
        }
      } catch (error) {
        console.log(error);
        const eventType = params?.type || "UNKNOWN_EVENT_TYPE";
        const channelError = error instanceof _channel.ChannelError ? error : _channel.ChannelErrors.HandleEventError({
          metadata: {
            channelId: this.channelId,
            eventType
          }
        });
        this.emit(_channel.ChannelErrorType.HANDLE_EVENT_ERROR, channelError);
        reject(channelError);
      }
    });
  }
  async sendEvent(event) {
    return Promise.resolve();
  }
  async open(params = {}) {
    if (this.state.open) {
      return Promise.reject(_channel.ChannelErrors.ChannelOpenError({
        metadata: {
          channelId: this.channelId
        }
      }));
    }
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
    const confirm = await this.dispatchRequest(request);
    this.peer.identifier = confirm.data.identifier;
    this.peer.publicKeys = confirm.data.publicKeys;
    this.peer.sharedKey = await this.spark.cipher.generateSharedKey({
      publicKey: this.peer.publicKeys.cipher
    });
    this.state.open = true;
    return Promise.resolve(confirm);
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
    const data = {
      ...request?.data,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys
    };
    this.state.open = true;
    this.peer.identifier = request.data.identifier;
    this.peer.publicKeys = request.data.publicKeys;
    this.peer.sharedKey = await this.spark.cipher.generateSharedKey({
      publicKey: this.peer.publicKeys.cipher
    });
    const confirm = new _ChannelEvent.ChannelConfirmEvent({
      type,
      metadata,
      data
    });
    await this.sendEvent(confirm);
    return Promise.resolve(confirm);
  }
  async close(params = {}) {
    if (!this.state.open) {
      return Promise.reject(_channel.ChannelErrors.ChannelClosedError({
        metadata: {
          channelId: this.channelId
        }
      }));
    }
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
    const confirm = await this.dispatchRequest(request);
    this.state.open = false;
    return Promise.resolve(confirm);
  }
  async confirmClose(request) {
    if (!this.state.open) {
      return Promise.reject(_channel.ChannelErrors.ChannelClosedError({
        metadata: {
          channelId: this.channelId
        }
      }));
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
    const data = {
      ...request?.data
    };
    const confirm = new _ChannelEvent.ChannelConfirmEvent({
      type,
      metadata,
      data
    });
    await this.sendEvent(confirm);
    this.state.open = false;
    return Promise.resolve(confirm);
  }
  async message(message) {
    const type = this.requestTypes.MESSAGE_REQUEST;
    const metadata = {
      channelId: this.channelId
    };
    const data = message;
    const encrypted = await this.spark.cipher.encrypt({
      data,
      sharedKey: this.peer.sharedKey
    });
    const seal = await this.spark.signer.seal({
      data: encrypted
    });
    const request = new _ChannelEvent.ChannelRequestEvent({
      type,
      metadata,
      seal
    });
    if (!this.state.open) {
      return Promise.reject(_channel.ChannelErrors.ChannelClosedError({
        metadata: {
          channelId: this.channelId
        }
      }));
    }
    const confirm = await this.dispatchRequest(request);
    return Promise.resolve(confirm);
  }
  async confirmMessage(request) {
    if (!this.state.open) {
      return Promise.reject(_channel.ChannelErrors.ChannelClosedError({
        metadata: {
          channelId: this.channelId
        }
      }));
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
    const opened = await this.spark.signer.open({
      signature: request.seal,
      publicKey: this.peer.publicKeys.signer
    });
    const decrypted = await this.spark.cipher.decrypt({
      data: opened,
      sharedKey: this.peer.sharedKey
    });
    const sealData = {
      type: request.type,
      timestamp: request.timestamp,
      metadata: request.metadata,
      data: decrypted
    };
    const encrypted = await this.spark.cipher.encrypt({
      data: sealData,
      sharedKey: this.peer.sharedKey
    });
    const seal = await this.spark.signer.seal({
      data: encrypted
    });
    const confirm = new _ChannelEvent.ChannelConfirmEvent({
      type,
      metadata,
      seal
    });
    await this.sendEvent(confirm);
    return Promise.resolve(confirm);
  }
  async getEventData(event) {
    const {
      data,
      seal
    } = event;
    if (!!data) return data;
    let opened, decrypted;
    try {
      opened = await this.spark.signer.open({
        signature: seal,
        publicKey: this.peer.publicKeys.signer
      }).catch(() => {});
      opened = opened || (await this.spark.signer.open({
        signature: seal,
        publicKey: this.peer.publicKeys.signer
      }).catch(() => {}));
      decrypted = await this.spark.cipher.decrypt({
        data: opened,
        sharedKey: this.peer.sharedKey
      }).catch(() => {});
      decrypted = decrypted || (await this.spark.cipher.decrypt({
        data: opened,
        sharedKey: this.peer.sharedKey
      }).catch(() => {}));
      return decrypted;
    } catch (error) {}
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
}
exports.CoreChannel = CoreChannel;