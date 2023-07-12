import cuid from "cuid";
import { ChannelEmitter } from "./ChannelEmitter/index.mjs";
import { ChannelConfirmEvent, ChannelRequestEvent, eventFromResponse } from "./ChannelEvent/index.mjs";
import { ChannelError, ChannelErrorType, ChannelErrors } from "../errors/channel.mjs";
export class CoreChannel extends ChannelEmitter {
  constructor({ spark, actions, channelId, peer }) {
    super();
    this.eventLog = [];
    this._eventTypes = {
      ANY_EVENT: "ANY_EVENT",
      ANY_ERROR: "ANY_ERROR",
      ANY_REQUEST: "ANY_REQUEST",
      ANY_CONFIRM: "ANY_CONFIRM"
    };
    this.preflightChecks = [];
    this.peer = peer || {};
    this.channelId = channelId || cuid();
    this.eventLog = [];
    this._actions = actions || [];
    for (let action of this._actions) {
      action.setContext({ spark, channel: this });
      action.actions.forEach((actionType) => {
        const requestType = `${actionType}_REQUEST`;
        const confirmType = `${actionType}_CONFIRM`;
        this.eventTypes[requestType] = requestType;
        this.eventTypes[confirmType] = confirmType;
      });
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
  export() {
    return {
      channelId: this.channelId,
      peer: this.peer,
      eventLog: this.eventLog
    };
  }
  requestPreflight(callback) {
    this.preflightChecks.push(callback);
  }
  dispatchRequest(event, attempt = 1) {
    return new Promise((resolve, reject) => {
      try {
        let timer;
        const action = this.getAction(event.type);
        const requestEvent = event;
        const confirmType = this.toConfirmType(event.type);
        const requetsType = requestEvent.type;
        const onConfirmed = (confirmedEvent) => {
          clearTimeout(timer);
          return resolve(confirmedEvent);
        };
        const onTimeout = () => {
          this.off(confirmType, onConfirmed);
          clearTimeout(timer);
          if (action[requetsType].retries - attempt > 0) {
            return this.dispatchRequest(event, attempt + 1);
          }
          const timeoutError = ChannelErrors.DispatchRequestTimeoutError({
            metadata: { eventType: requetsType }
          });
          this.emit(ChannelErrorType.DISPATCH_REQUEST_TIMEOUT_ERROR, timeoutError);
          reject(timeoutError);
        };
        if (action[requetsType].timeout) {
          timer = setTimeout(onTimeout, action[requetsType].timeout);
        }
        this.once(confirmType, onConfirmed);
        for (let preflightCheck of this.preflightChecks) {
          preflightCheck(requestEvent);
        }
        this.sendRequest(requestEvent).catch((error) => {
          throw error;
        });
      } catch (error) {
        const eventType = event?.type || "unknown";
        const sparkError = error instanceof ChannelError ? error : ChannelErrors.DispatchRequestError({ metadata: { eventType }, message: error.message });
        this.emit(ChannelErrorType.DISPATCH_REQUEST_ERROR, sparkError);
      }
    });
  }
  async handleResponse(event) {
    return new Promise(async (resolve, reject) => {
      event = eventFromResponse(event);
      try {
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
            this.eventLog.push({ ...confirmEvent, request: true });
            for (let preflightCheck of this.preflightChecks) {
              preflightCheck(requestEvent);
            }
            this.emit(requestType, requestEvent);
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
        const eventType = event?.type || "unknown";
        const sparkError = error instanceof ChannelError ? error : ChannelErrors.HandleResponseError({ metadata: { eventType }, message: error.message });
        this.emit(ChannelErrorType.HANDLE_RESPONSE_ERROR, sparkError);
      }
    });
  }
  sendRequest(event) {
    throw Error("sendRequest not implemented");
  }
}
