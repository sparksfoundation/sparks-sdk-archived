import { SparkConfirmEvent, SparkErrorEvent, SparkEvent, SparkRequestEvent } from ".";

export type RequestEventType = `${string}_REQUEST`;
export type ConfirmEventType = `${string}_CONFIRM`;
export type ErrorEventType = `${string}_ERROR`;
export type EventId = string;
export type EventType = RequestEventType | ConfirmEventType | ErrorEventType;

export type SparkEventParams = {
  readonly type: EventType;
  readonly metadata: { eventId: EventId } & Record<string, any>;
  readonly timestamp: number;
} & ({
  readonly data: Record<string, any>;
  readonly digest?: undefined;
} | {
  readonly digest: string
  readonly data?: undefined;
});

export type CreateEventParams = {
  type: EventType;
  metadata?: Record<string, any>;
} & ({
  data: Record<string, any>;
  digest?: undefined;
} | {
  digest: string
  data?: undefined;
});

export interface SparkEventInterface {
  readonly type: EventType;
  readonly metadata: Record<string, any>;
  readonly timestamp: number;
  readonly data?: Record<string, any>;
  readonly digest?: string;
}

export type CreateEventFunction = {
  (event: { type: RequestEventType; metadata?: Record<string, any>; data?: undefined; digest: string }): SparkRequestEvent;
  (event: { type: RequestEventType; metadata?: Record<string, any>; data: Record<string, any>; digest?: undefined }): SparkRequestEvent;
  (event: { type: ConfirmEventType; metadata?: Record<string, any>; data?: undefined; digest: string }): SparkConfirmEvent;
  (event: { type: ConfirmEventType; metadata?: Record<string, any>; data: Record<string, any>; digest?: undefined }): SparkConfirmEvent;
  (event: { type: ErrorEventType; metadata?: Record<string, any>; data: Record<string, any>; digest?: undefined }): SparkErrorEvent;
};
