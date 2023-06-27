import { utcEpochTimestamp } from ".";
import { ChannelEventType } from "../channel/ChannelEvent";

// events
export type EventTimestamp = number;             // utc epoch time in ms
export type EventId = string;                    // unique id for the event
export type EventMetadata = Record<string, any>; // additional metadata about the event
export type EventPayload = string | Record<string, any>;     // data associated with the event

export type EventType = ChannelEventType;

export interface EventInterface {
  type: EventType;
  timestamp: EventTimestamp;
  metadata: EventMetadata;
  payload?: EventPayload;
}

export class SparkEvent implements EventInterface {
  public type: EventType;
  public timestamp: EventTimestamp;
  public metadata: EventMetadata;
  public payload?: EventPayload;

  constructor(params: { type: EventType, metadata?: EventMetadata, payload?: EventPayload }) {
    const { type, metadata = {}, payload = {}} = params;
    this.type = type;
    this.timestamp = utcEpochTimestamp();
    this.metadata = { ...metadata };
    this.payload = typeof payload === 'string' ? payload : { ...payload };
  }

  public static is(obj: any): obj is SparkEvent {
    return obj instanceof SparkEvent;
  }

  public static get(...objs): EventInterface | null {
    return objs.reduce((acc, obj) => {
      if (SparkEvent.is(obj)) {
        if (acc) acc.previous = obj;
        else acc = obj;
      }
      return acc;
    }, null);
  }
}