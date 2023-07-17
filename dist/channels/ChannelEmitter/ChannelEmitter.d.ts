import { EventEmitter } from "eventemitter3";
import { EmitMethod, ListenerHandler, MultiEventOverload } from "./types";
export declare class ChannelEmitter extends EventEmitter {
    _multiEventOverload: MultiEventOverload<this>;
    addListener: ListenerHandler<this>;
    on: ListenerHandler<this>;
    once: ListenerHandler<this>;
    prependListener: ListenerHandler<this>;
    prependOnceListener: ListenerHandler<this>;
    removeListener: ListenerHandler<this>;
    off: ListenerHandler<this>;
    emit: EmitMethod<this>;
    eventNames(): (string | symbol)[];
}
