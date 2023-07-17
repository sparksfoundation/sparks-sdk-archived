"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChannelErrors = exports.ChannelErrorType = exports.ChannelError = void 0;
var _SparkError = require("./SparkError.cjs");
const ChannelErrorType = {
  REQUEST_ACTION_ERROR: "REQUEST_ACTION_ERROR",
  HANDLE_EVENT_ERROR: "HANDLE_EVENT_ERROR",
  DISPATCH_REQUEST_ERROR: "DISPATCH_REQUEST_ERROR",
  INVALID_EVENT_TYPE_ERROR: "INVALID_EVENT_TYPE_ERROR",
  CONFIRM_TIMEOUT_ERROR: "CONFIRM_TIMEOUT_ERROR",
  CHANNEL_CLOSED_ERROR: "CHANNEL_CLOSED_ERROR",
  CHANNEL_OPEN_ERROR: "CHANNEL_OPEN_ERROR",
  CHANNEL_NOT_FOUND_ERROR: "CHANNEL_NOT_FOUND_ERROR",
  NO_STREAMS_AVAILABLE_ERROR: "NO_STREAMS_AVAILABLE_ERROR"
};
exports.ChannelErrorType = ChannelErrorType;
class ChannelError extends _SparkError.SparkError {
  constructor(params) {
    super(params);
  }
}
exports.ChannelError = ChannelError;
class ChannelErrors {
  static RequestActionError({
    metadata = {},
    message,
    stack
  } = {}) {
    return new ChannelError({
      type: ChannelErrorType.REQUEST_ACTION_ERROR,
      message: `Error requesting action${message ? `: ${message}` : ""}`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static HandleEventError({
    metadata = {},
    message,
    stack
  } = {}) {
    return new ChannelError({
      type: ChannelErrorType.HANDLE_EVENT_ERROR,
      message: `Error handling response${message ? `: ${message}` : ""}`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static DispatchRequestError({
    metadata = {},
    message,
    stack
  } = {}) {
    return new ChannelError({
      type: ChannelErrorType.DISPATCH_REQUEST_ERROR,
      message: `Error dispatching request${message ? `: ${message}` : ""}`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static InvalidEventTypeError({
    metadata = {},
    message,
    stack
  } = {}) {
    return new ChannelError({
      type: ChannelErrorType.INVALID_EVENT_TYPE_ERROR,
      message: `Invalid event type error${message ? `: ${message}` : ""}`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static ConfirmTimeoutError({
    metadata = {},
    message,
    stack
  } = {}) {
    return new ChannelError({
      type: ChannelErrorType.CONFIRM_TIMEOUT_ERROR,
      message: `Confirm timeout error${message ? `: ${message}` : ""}`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static ChannelClosedError({
    metadata = {},
    message,
    stack
  } = {}) {
    return new ChannelError({
      type: ChannelErrorType.CHANNEL_CLOSED_ERROR,
      message: `Channel closed error${message ? `: ${message}` : ""}`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static ChannelOpenError({
    metadata = {},
    message,
    stack
  } = {}) {
    return new ChannelError({
      type: ChannelErrorType.CHANNEL_OPEN_ERROR,
      message: `Channel open error${message ? `: ${message}` : ""}`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static ChannelNotFoundError({
    metadata = {},
    message,
    stack
  } = {}) {
    return new ChannelError({
      type: ChannelErrorType.CHANNEL_NOT_FOUND_ERROR,
      message: `Channel not found error${message ? `: ${message}` : ""}`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static NoStreamsAvailableError({
    metadata = {},
    message,
    stack
  } = {}) {
    return new ChannelError({
      type: ChannelErrorType.NO_STREAMS_AVAILABLE_ERROR,
      message: `No streams available error${message ? `: ${message}` : ""}`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
}
exports.ChannelErrors = ChannelErrors;