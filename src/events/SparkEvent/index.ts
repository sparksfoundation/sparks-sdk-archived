import { randomCuid, utcEpochTimestamp } from "../../utilities";
import { ConfirmEventType, CreateEventFunction, CreateEventParams, ErrorEventType, RequestEventType, SparkEventInterface, SparkEventParams } from "./types";


export class SparkEvent implements SparkEventInterface {
  readonly type:  RequestEventType | ConfirmEventType | ErrorEventType;
  readonly timestamp: number;
  readonly metadata: Record<string, any>;
  readonly data: Record<string, any>;
  readonly digest: string;

  constructor(args: SparkEventParams) {
    this.type = args.type;
    this.metadata = args.metadata;
    this.timestamp = args.timestamp;
    if (args.data) this.data = args.data;
    if (args.digest) this.digest = args.digest;
  }
}

export class SparkRequestEvent extends SparkEvent {
  declare readonly type: RequestEventType;
}
export class SparkConfirmEvent extends SparkEvent {
  declare readonly type: ConfirmEventType;
}
export class SparkErrorEvent extends SparkEvent {
  declare readonly type: ErrorEventType;
}

export const createEvent: CreateEventFunction = (params: CreateEventParams): any => {
  const { type, data, digest } = params;
  const timestamp: number = utcEpochTimestamp();
  const metadata = { ...(params.metadata || {}), eventId: randomCuid() };

  const invalidEvent = (!type.endsWith("_REQUEST") && !type.endsWith("_CONFIRM") && !type.endsWith("_ERROR"));
  const invalidParams = !!((data && digest) || (!data && !digest));

  let event;
  if (!!data) event = new SparkEvent({ type, metadata, timestamp, data });
  else if (!!digest) event = new SparkEvent({ type, metadata, timestamp, digest });
  else event = null;

  if (invalidEvent || invalidParams || !event) {
    throw new SparkEvent({
      type: 'CREATE_EVENT_ERROR',
      metadata: {
        eventId: randomCuid()
      },
      timestamp,
      data: { message: invalidEvent ? `Invalid event type: ${type}` : `Invalid event params: ${JSON.stringify(params)}` },
    });
  }

  // TODO - settings for optional logging
  const isError = event.type.endsWith("_ERROR");
  // if (isError) console.error(event);

  return event;
};
