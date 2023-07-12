import { SparkError } from "./SparkError.mjs";
export var ChannelErrorType = /* @__PURE__ */ ((ChannelErrorType2) => {
  ChannelErrorType2["REQUEST_ACTION_ERROR"] = "REQUEST_ACTION_ERROR";
  ChannelErrorType2["HANDLE_RESPONSE_ERROR"] = "HANDLE_RESPONSE_ERROR";
  ChannelErrorType2["DISPATCH_REQUEST_ERROR"] = "DISPATCH_REQUEST_ERROR";
  ChannelErrorType2["DISPATCH_REQUEST_TIMEOUT_ERROR"] = "DISPATCH_REQUEST_TIMEOUT_ERROR";
  return ChannelErrorType2;
})(ChannelErrorType || {});
export class ChannelError extends SparkError {
  constructor(params) {
    super(params);
  }
}
export class ChannelErrors {
  static RequestActionError({ metadata = {}, message, stack } = {}) {
    return new ChannelError({
      type: "REQUEST_ACTION_ERROR" /* REQUEST_ACTION_ERROR */,
      message: `Error requesting action${message ? `: ${message}` : ""}`,
      metadata: { ...metadata },
      stack
    });
  }
  static HandleResponseError({ metadata = {}, message, stack } = {}) {
    return new ChannelError({
      type: "HANDLE_RESPONSE_ERROR" /* HANDLE_RESPONSE_ERROR */,
      message: `Error handling response${message ? `: ${message}` : ""}`,
      metadata: { ...metadata },
      stack
    });
  }
  static DispatchRequestError({ metadata = {}, message, stack } = {}) {
    return new ChannelError({
      type: "DISPATCH_REQUEST_ERROR" /* DISPATCH_REQUEST_ERROR */,
      message: `Error dispatching request${message ? `: ${message}` : ""}`,
      metadata: { ...metadata },
      stack
    });
  }
  static DispatchRequestTimeoutError({ metadata = {}, message, stack } = {}) {
    return new ChannelError({
      type: "DISPATCH_REQUEST_TIMEOUT_ERROR" /* DISPATCH_REQUEST_TIMEOUT_ERROR */,
      message: `Request timeout error${message ? `: ${message}` : ""}`,
      metadata: { ...metadata },
      stack
    });
  }
}
