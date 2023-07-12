import { EventEmitter } from "events";
import { ChannelEmitterEventType, ChannelEmitterReturnType } from "./types";
import { EmitMethod, EmitterMethodName, ListenerHandler, MultiEventOverload } from "./types";
import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent";
import { ChannelError } from "../../errors/channel";

export class ChannelEmitter extends EventEmitter {
    _multiEventOverload: MultiEventOverload<this> = (method: EmitterMethodName, eventTypes: ChannelEmitterEventType | ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void) => {
        if (Array.isArray(eventTypes)) {
            eventTypes.forEach(eventType => this._multiEventOverload(method, eventType, listener));
        } else {
            super[method](eventTypes, listener);
        }
        return this;
    }

    addListener: ListenerHandler<this> = (eventType: ChannelEmitterEventType | ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void) => {
        return this._multiEventOverload('addListener', eventType, listener);
    }

    on: ListenerHandler<this> = (eventType: ChannelEmitterEventType | ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void) => {
        return this._multiEventOverload('on', eventType, listener);
    }

    once: ListenerHandler<this> = (eventType: ChannelEmitterEventType | ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void) => {
        return this._multiEventOverload('once', eventType, listener);
    }

    prependListener: ListenerHandler<this> = (eventType: ChannelEmitterEventType | ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void) => {
        return this._multiEventOverload('prependListener', eventType, listener);
    }

    prependOnceListener: ListenerHandler<this> = (eventType: ChannelEmitterEventType | ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void) => {
        return this._multiEventOverload('prependOnceListener', eventType, listener);
    }

    removeListener: ListenerHandler<this> = (eventType: ChannelEmitterEventType | ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void) => {
        return this._multiEventOverload('removeListener', eventType, listener);
    }

    off: ListenerHandler<this> = (eventType: ChannelEmitterEventType | ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void) => {
        return this._multiEventOverload('off', eventType, listener);
    }

    emit: EmitMethod<this> = (eventType: ChannelEmitterEventType, event: ChannelEmitterReturnType) => {
        const result = super.emit(eventType, event);
        super.emit('ANY_EVENT', event);
        if (event instanceof ChannelError) {
            super.emit('ANY_ERROR', event);
        } else if (event instanceof ChannelRequestEvent) {
            super.emit('ANY_REQUEST', event);
        } else if (event instanceof ChannelConfirmEvent) {
            super.emit('ANY_CONFIRM', event);
        }
        return result;
    }

    eventNames(): (string | symbol)[] {
        return super.eventNames();
    }
}

