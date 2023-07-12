import { EventEmitter } from "events";
import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent/index.mjs";
import { ChannelError } from "../../errors/channel.mjs";
export class ChannelEmitter extends EventEmitter {
  constructor() {
    super(...arguments);
    this._multiEventOverload = (method, eventTypes, listener) => {
      if (Array.isArray(eventTypes)) {
        eventTypes.forEach((eventType) => this._multiEventOverload(method, eventType, listener));
      } else {
        super[method](eventTypes, listener);
      }
      return this;
    };
    this.addListener = (eventType, listener) => {
      return this._multiEventOverload("addListener", eventType, listener);
    };
    this.on = (eventType, listener) => {
      return this._multiEventOverload("on", eventType, listener);
    };
    this.once = (eventType, listener) => {
      return this._multiEventOverload("once", eventType, listener);
    };
    this.prependListener = (eventType, listener) => {
      return this._multiEventOverload("prependListener", eventType, listener);
    };
    this.prependOnceListener = (eventType, listener) => {
      return this._multiEventOverload("prependOnceListener", eventType, listener);
    };
    this.removeListener = (eventType, listener) => {
      return this._multiEventOverload("removeListener", eventType, listener);
    };
    this.off = (eventType, listener) => {
      return this._multiEventOverload("off", eventType, listener);
    };
    this.emit = (eventType, event) => {
      const result = super.emit(eventType, event);
      super.emit("ANY_EVENT", event);
      if (event instanceof ChannelError) {
        super.emit("ANY_ERROR", event);
      } else if (event instanceof ChannelRequestEvent) {
        super.emit("ANY_REQUEST", event);
      } else if (event instanceof ChannelConfirmEvent) {
        super.emit("ANY_CONFIRM", event);
      }
      return result;
    };
  }
  eventNames() {
    return super.eventNames();
  }
}
