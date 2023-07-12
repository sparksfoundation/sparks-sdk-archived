import { SparkError, SparkErrorParams } from "./SparkError";

export enum ChannelErrorType {
  REQUEST_ACTION_ERROR = 'REQUEST_ACTION_ERROR',
  HANDLE_RESPONSE_ERROR = 'HANDLE_RESPONSE_ERROR',
  DISPATCH_REQUEST_ERROR = 'DISPATCH_REQUEST_ERROR',
  DISPATCH_REQUEST_TIMEOUT_ERROR = 'DISPATCH_REQUEST_TIMEOUT_ERROR',
}

export interface ChannelError extends SparkError {
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

  static HandleResponseError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.HANDLE_RESPONSE_ERROR as ChannelErrorType,
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

  static DispatchRequestTimeoutError({ metadata = {}, message, stack }: SparkErrorParams = {}): ChannelError {
    return new ChannelError({
      type: ChannelErrorType.DISPATCH_REQUEST_TIMEOUT_ERROR as ChannelErrorType,
      message: `Request timeout error${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }
}

