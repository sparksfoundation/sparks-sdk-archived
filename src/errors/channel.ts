import { SparkError, SparkErrorParams } from "./SparkError";

export const ChannelErrorType = {
  REQUEST_ACTION_ERROR: 'REQUEST_ACTION_ERROR',
  HANDLE_EVENT_ERROR: 'HANDLE_EVENT_ERROR',
  DISPATCH_REQUEST_ERROR: 'DISPATCH_REQUEST_ERROR',
  INVALID_EVENT_TYPE_ERROR: 'INVALID_EVENT_TYPE_ERROR',
  CONFIRM_TIMEOUT_ERROR: 'CONFIRM_TIMEOUT_ERROR',
  CHANNEL_CLOSED_ERROR: 'CHANNEL_CLOSED_ERROR',
  OPEN_REJECTED_ERROR: 'OPEN_REJECTED_ERROR',
  CHANNEL_NOT_FOUND_ERROR: 'CHANNEL_NOT_FOUND_ERROR',
  NO_STREAMS_AVAILABLE_ERROR: 'NO_STREAMS_AVAILABLE_ERROR',
} as const;

export type ChannelErrorType = typeof ChannelErrorType[keyof typeof ChannelErrorType];

export interface ChannelError extends SparkError {
  type: ChannelErrorType;
}

export interface ChannelErrorParams extends SparkErrorParams {
  type: ChannelErrorType;
}

export class ChannelError extends SparkError implements ChannelError {
  constructor(params: SparkErrorParams) {
    super(params);
  }
}

export class ChannelErrors {
  static RequestActionError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.REQUEST_ACTION_ERROR as ChannelErrorType,
      message: `Error requesting action${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  static HandleEventError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.HANDLE_EVENT_ERROR as ChannelErrorType,
      message: `Error handling response${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  static DispatchRequestError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.DISPATCH_REQUEST_ERROR as ChannelErrorType,
      message: `Error dispatching request${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  static InvalidEventTypeError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.INVALID_EVENT_TYPE_ERROR as ChannelErrorType,
      message: `Invalid event type error${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  static ConfirmTimeoutError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.CONFIRM_TIMEOUT_ERROR as ChannelErrorType,
      message: `Confirm timeout error${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  static ChannelClosedError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.CHANNEL_CLOSED_ERROR as ChannelErrorType,
      message: `Channel closed error${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  static ChannelNotFoundError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.CHANNEL_NOT_FOUND_ERROR as ChannelErrorType,
      message: `Channel not found error${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  static NoStreamsAvailableError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.NO_STREAMS_AVAILABLE_ERROR as ChannelErrorType,
      message: `No streams available error${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  static OpenRejectedError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.OPEN_REJECTED_ERROR as ChannelErrorType,
      message: `Open rejected error${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }
}

