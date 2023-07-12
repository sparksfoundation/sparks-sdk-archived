import { ChannelError } from "../../errors/channel";
import { ChannelEvent } from "../ChannelEvent/ChannelEvent";
import { ChannelEventType } from "../ChannelEvent/types";
export type ListenerHaneder = (...args: any[]) => void;
export type ChannelEmitterErrorType = `${Uppercase<string>}_ERROR`;
export type ChannelEmitterEventType = ChannelEventType | ChannelEmitterErrorType;
export type ChannelEmitterReturnType = ChannelEvent<any, any> | ChannelError;
export type EmitterMethodName = 'addListener' | 'on' | 'once' | 'prependListener' | 'prependOnceListener' | 'removeListener' | 'off';
export type MultiEventOverload<T> = {
    (method: EmitterMethodName, eventType: ChannelEmitterEventType, listener: (event: ChannelEmitterReturnType) => void): T;
    (method: EmitterMethodName, eventType: ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void): T;
    (method: EmitterMethodName, eventType: ChannelEmitterEventType | ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void): T;
};
export type ListenerHandler<T> = {
    (eventType: ChannelEmitterEventType, listener: (event: ChannelEmitterReturnType) => void): T;
    (eventType: ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void): T;
    (eventType: ChannelEmitterEventType | ChannelEmitterEventType[], listener: (event: ChannelEmitterReturnType) => void): T;
};
export type EmitMethod<T> = {
    (eventType: ChannelEmitterEventType, event: ChannelEmitterReturnType): boolean;
    (eventType: string, event: ChannelEmitterReturnType): boolean;
};
