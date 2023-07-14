import cuid from "cuid";
import { ChannelEmitter } from "./ChannelEmitter/index.mjs";
import { ChannelConfirmEvent, ChannelRequestEvent } from "./ChannelEvent/index.mjs";
import { ChannelError, ChannelErrorType, ChannelErrors } from "../errors/channel.mjs";
const _CoreChannel = class extends ChannelEmitter {
  constructor({ spark, actions, channelId, peer, eventLog, timeout }) {
    super();
    this.eventLog = [];
    this._errorTypes = {
      ANY_ERROR: "ANY_ERROR"
    };
    this._eventTypes = {
      ANY_EVENT: "ANY_EVENT",
      ANY_REQUEST: "ANY_REQUEST",
      ANY_CONFIRM: "ANY_CONFIRM"
    };
    this.preflightChecks = [];
    this.peer = peer || {};
    this.channelId = channelId || cuid();
    this.eventLog = [...eventLog || []];
    this._spark = spark;
    this._actions = actions || [];
    this.timeout = timeout !== void 0 ? timeout : _CoreChannel.timeout;
    for (let action of this._actions) {
      action.setContext({ channel: this });
      action.actions.forEach((actionType) => {
        const requestType = `${actionType}_REQUEST`;
        const confirmType = `${actionType}_CONFIRM`;
        this.eventTypes[requestType] = requestType;
        this.eventTypes[confirmType] = confirmType;
      });
    }
    for (let errorType in ChannelErrorType) {
      this._errorTypes[errorType] = ChannelErrorType[errorType];
    }
  }
  getAction(typeOrName) {
    const action = this._actions.find((action2) => action2.name === typeOrName) || this._actions.find((action2) => action2.hasOwnProperty(typeOrName));
    if (!action)
      throw Error("invalid action");
    return action;
  }
  toConfirmType(eventType) {
    const confirmType = eventType.replace("_REQUEST", "_CONFIRM");
    if (!this._eventTypes[confirmType])
      throw Error("invalid request type");
    return confirmType;
  }
  get eventTypes() {
    return this._eventTypes;
  }
  get errorTypes() {
    return this._errorTypes;
  }
  get requestTypes() {
    const requestTypes = {};
    for (let eventType in this._eventTypes) {
      if (eventType.endsWith("_REQUEST")) {
        requestTypes[eventType] = eventType;
      }
    }
    return requestTypes;
  }
  get confirmTypes() {
    const confirmTypes = {};
    for (let eventType in this._eventTypes) {
      if (eventType.endsWith("_CONFIRM")) {
        confirmTypes[eventType] = eventType;
      }
    }
    return confirmTypes;
  }
  export() {
    return {
      type: this.type,
      channelId: this.channelId,
      peer: this.peer || {},
      eventLog: this.eventLog || []
    };
  }
  requestPreflight(callback) {
    this.preflightChecks.push(callback);
  }
  dispatchRequest(event, attempt = 1) {
    return new Promise((resolve, reject) => {
      try {
        let timer;
        const requestEvent = event;
        const confirmType = this.toConfirmType(event.type);
        const requestType = requestEvent.type;
        const onConfirmed = (confirmedEvent) => {
          clearTimeout(timer);
          return resolve(confirmedEvent);
        };
        const onTimeout = () => {
          this.off(confirmType, onConfirmed);
          clearTimeout(timer);
          const timeoutError = ChannelErrors.DispatchRequestTimeoutError({ metadata: { eventType: requestType } });
          this.emit(ChannelErrorType.REQUEST_TIMEOUT_ERROR, timeoutError);
          reject(timeoutError);
        };
        if (this.timeout) {
          timer = setTimeout(onTimeout, this.timeout);
        }
        this.once(confirmType, onConfirmed);
        for (let preflightCheck of this.preflightChecks) {
          preflightCheck(requestEvent);
        }
        this.eventLog.push({ ...requestEvent, request: true });
        this.sendRequest(requestEvent).catch((error) => {
          throw error;
        });
      } catch (error) {
        console.log(error);
        const eventType = event?.type || "unknown";
        const sparkError = error instanceof ChannelError ? error : ChannelErrors.DispatchRequestError({ metadata: { eventType }, message: error.message });
        this.emit(ChannelErrorType.DISPATCH_REQUEST_ERROR, sparkError);
        reject(sparkError);
      }
    });
  }
  async handleResponse(event) {
    if (!event.type || !this.eventTypes[event.type] && !this.errorTypes[event.type])
      return;
    return new Promise(async (resolve, reject) => {
      try {
        if (this.requestTypes[event.type]) {
          event = new ChannelRequestEvent({ ...event });
        } else if (this.confirmTypes[event.type]) {
          event = new ChannelConfirmEvent({ ...event });
        } else {
          event = new ChannelError(event);
        }
        switch (true) {
          case event instanceof ChannelError:
            throw event;
          case event instanceof ChannelRequestEvent:
            const requestEvent = event;
            const requestType = requestEvent.type;
            const confirmType = this.toConfirmType(requestType);
            const action = this.getAction(requestType);
            this.eventLog.push({ ...requestEvent, response: true });
            const confirmEvent = await action[confirmType](requestEvent).catch((error) => {
              throw error;
            });
            for (let preflightCheck of this.preflightChecks) {
              preflightCheck(requestEvent);
            }
            this.emit(requestType, requestEvent);
            this.eventLog.push({ ...confirmEvent, request: true });
            this.sendRequest(confirmEvent).catch((error) => {
              throw error;
            });
            resolve();
            break;
          case event instanceof ChannelConfirmEvent:
            const confirmedEvent = event;
            this.eventLog.push({ ...confirmedEvent, response: true });
            this.emit(confirmedEvent.type, confirmedEvent);
            resolve();
            break;
          default:
            throw Error("invalid event");
        }
      } catch (error) {
        console.log(error);
        const eventType = event?.type || "CHANNEL_ERROR";
        const sparkError = error instanceof ChannelError ? error : ChannelErrors.HandleResponseError({ metadata: { eventType }, message: error.message });
        this.emit(ChannelErrorType.HANDLE_RESPONSE_ERROR, sparkError);
        reject(sparkError);
      }
    });
  }
  async sealEvent(event) {
    if (!!event.seal)
      return event;
    return await event.sealData({
      cipher: this._spark.cipher,
      signer: this._spark.signer,
      sharedKey: this.peer.sharedKey
    });
  }
  async openEvent(event) {
    if (!!event.data)
      return event;
    return await event.openData({
      cipher: this._spark.cipher,
      signer: this._spark.signer,
      sharedKey: this.peer.sharedKey,
      publicKey: this.peer.publicKeys.signer
    });
  }
  get identifier() {
    return this._spark.identifier;
  }
  get publicKeys() {
    return this._spark.publicKeys;
  }
  get sharedKey() {
    return this.peer.sharedKey;
  }
  async setSharedKey(publicKey) {
    const sharedKey = await this._spark.cipher.generateSharedKey({ publicKey });
    this.peer.sharedKey = sharedKey;
    return Promise.resolve();
  }
  sendRequest(event) {
    throw Error("sendRequest not implemented");
  }
};
export let CoreChannel = _CoreChannel;
CoreChannel.timeout = 2e3;
