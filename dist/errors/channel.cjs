"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChannelErrors = exports.ChannelErrorName = void 0;
var _SparkError = require("./SparkError.cjs");
var ChannelErrorName = /* @__PURE__ */(ChannelErrorName2 => {
  ChannelErrorName2["CREATE_RECEIPT_DIGEST_ERROR"] = "CREATE_RECEIPT_DIGEST_ERROR";
  ChannelErrorName2["CREATE_EVENT_ERROR"] = "CREATE_EVENT_ERROR";
  ChannelErrorName2["SET_PEER_ERROR"] = "SET_PEER_ERROR";
  ChannelErrorName2["OPEN_REQUEST_ERROR"] = "OPEN_REQUEST_ERROR";
  ChannelErrorName2["ON_OPEN_REQUESTED_ERROR"] = "ON_OPEN_REQUESTED_ERROR";
  ChannelErrorName2["ACCEPT_OPEN_ERROR"] = "ACCEPT_OPEN_ERROR";
  ChannelErrorName2["REJECT_OPEN_ERROR"] = "REJECT_OPEN_ERROR";
  ChannelErrorName2["ON_OPEN_ACCEPTED_ERROR"] = "ON_OPEN_ACCEPTED_ERROR";
  ChannelErrorName2["CONFIRM_OPEN_ERROR"] = "CONFIRM_OPEN_ERROR";
  ChannelErrorName2["OPEN_CONFIRMED_ERROR"] = "OPEN_CONFIRMED_ERROR";
  ChannelErrorName2["OPEN_REJECTED_ERROR"] = "OPEN_REJECTED_ERROR";
  ChannelErrorName2["COMPLETE_OPEN_ERROR"] = "COMPLETE_OPEN_ERROR";
  ChannelErrorName2["CLOSE_ERROR"] = "CLOSE_ERROR";
  ChannelErrorName2["ON_CLOSED_ERROR"] = "ON_CLOSED_ERROR";
  ChannelErrorName2["ON_CLOSE_CONFIRMED_ERROR"] = "ON_CLOSE_CONFIRMED_ERROR";
  ChannelErrorName2["CONFIRM_CLOSE_ERROR"] = "CONFIRM_CLOSE_ERROR";
  ChannelErrorName2["COMPLETE_CLOSE_ERROR"] = "COMPLETE_CLOSE_ERROR";
  ChannelErrorName2["CREATE_MESSAGE_DIGEST_ERROR"] = "CREATE_MESSAGE_DIGEST_ERROR";
  ChannelErrorName2["OPEN_MESSAGE_DIGEST_ERROR"] = "OPEN_MESSAGE_DIGEST_ERROR";
  ChannelErrorName2["MESSAGE_SENDING_ERROR"] = "MESSAGE_SENDING_ERROR";
  ChannelErrorName2["ON_MESSAGE_CONFIRMED_ERROR"] = "ON_MESSAGE_CONFIRMED_ERROR";
  ChannelErrorName2["CONFIRM_MESSAGE_ERROR"] = "CONFIRM_MESSAGE_ERROR";
  ChannelErrorName2["COMPLETE_MESSAGE_ERROR"] = "COMPLETE_MESSAGE_ERROR";
  ChannelErrorName2["HANDLE_REQUEST_ERROR"] = "HANDLE_REQUEST_ERROR";
  ChannelErrorName2["HANDLE_RESPONSE_ERROR"] = "HANDLE_RESPONSE_ERROR";
  ChannelErrorName2["ON_MESSAGE_ERROR"] = "ON_MESSAGE_ERROR";
  ChannelErrorName2["ON_CLOSE_ERROR"] = "ON_CLOSE_ERROR";
  ChannelErrorName2["ON_ERROR_ERROR"] = "ON_ERROR_ERROR";
  ChannelErrorName2["GET_EVENT_MESSAGE_ERROR"] = "GET_EVENT_MESSAGE_ERROR";
  return ChannelErrorName2;
})(ChannelErrorName || {});
exports.ChannelErrorName = ChannelErrorName;
class ChannelErrors {
  static CreateReceiptDigestError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "CREATE_RECEIPT_DIGEST_ERROR" /* CREATE_RECEIPT_DIGEST_ERROR */,
      message: `failed to create receipt digest`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static CreateEventError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "CREATE_EVENT_ERROR" /* CREATE_EVENT_ERROR */,
      message: `failed to create event`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static SetPeerError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "SET_PEER_ERROR" /* SET_PEER_ERROR */,
      message: `failed to set peer`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OpenRequestError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "OPEN_REQUEST_ERROR" /* OPEN_REQUEST_ERROR */,
      message: `failed to open request`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OnOpenRequestedError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "ON_OPEN_REQUESTED_ERROR" /* ON_OPEN_REQUESTED_ERROR */,
      message: `failed to on open requested`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static AcceptOpenError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "ACCEPT_OPEN_ERROR" /* ACCEPT_OPEN_ERROR */,
      message: `failed to accept open`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static RejectOpenError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "REJECT_OPEN_ERROR" /* REJECT_OPEN_ERROR */,
      message: `failed to reject open`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OnOpenAcceptedError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "ON_OPEN_ACCEPTED_ERROR" /* ON_OPEN_ACCEPTED_ERROR */,
      message: `failed to on open accepted`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static ConfirmOpenError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "CONFIRM_OPEN_ERROR" /* CONFIRM_OPEN_ERROR */,
      message: `failed to confirm open`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OpenConfirmedError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "OPEN_CONFIRMED_ERROR" /* OPEN_CONFIRMED_ERROR */,
      message: `failed to open confirmed`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OpenRejectedError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "OPEN_REJECTED_ERROR" /* OPEN_REJECTED_ERROR */,
      message: `failed to open rejected`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static CompleteOpenError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "COMPLETE_OPEN_ERROR" /* COMPLETE_OPEN_ERROR */,
      message: `failed to complete open`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static CloseError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "CLOSE_ERROR" /* CLOSE_ERROR */,
      message: `failed to close`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OnClosedError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "ON_CLOSED_ERROR" /* ON_CLOSED_ERROR */,
      message: `failed to on closed`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OnCloseConfirmedError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "ON_CLOSE_CONFIRMED_ERROR" /* ON_CLOSE_CONFIRMED_ERROR */,
      message: `failed to on close confirmed`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static ConfirmCloseError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "CONFIRM_CLOSE_ERROR" /* CONFIRM_CLOSE_ERROR */,
      message: `failed to confirm close`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static CompleteCloseError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "COMPLETE_CLOSE_ERROR" /* COMPLETE_CLOSE_ERROR */,
      message: `failed to complete close`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static CreateMessageDigestError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "CREATE_MESSAGE_DIGEST_ERROR" /* CREATE_MESSAGE_DIGEST_ERROR */,
      message: `failed to create message digest`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OpenMessageDigestError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "OPEN_MESSAGE_DIGEST_ERROR" /* OPEN_MESSAGE_DIGEST_ERROR */,
      message: `failed to open message digest`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static MessageSendingError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "MESSAGE_SENDING_ERROR" /* MESSAGE_SENDING_ERROR */,
      message: `failed to send message`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OnMessageConfirmedError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "ON_MESSAGE_CONFIRMED_ERROR" /* ON_MESSAGE_CONFIRMED_ERROR */,
      message: `failed to process message confirmation`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static ConfirmMessageError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "CONFIRM_MESSAGE_ERROR" /* CONFIRM_MESSAGE_ERROR */,
      message: `failed to confirm message`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static GetEventMessageError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "GET_EVENT_MESSAGE_ERROR" /* GET_EVENT_MESSAGE_ERROR */,
      message: `failed to get event message`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static CompleteMessageError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "COMPLETE_MESSAGE_ERROR" /* COMPLETE_MESSAGE_ERROR */,
      message: `failed to complete message`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static HandleRequestError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "HANDLE_REQUEST_ERROR" /* HANDLE_REQUEST_ERROR */,
      message: `failed to handle request`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static HandleResponseError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "HANDLE_RESPONSE_ERROR" /* HANDLE_RESPONSE_ERROR */,
      message: `failed to handle response`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OnMessageError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "ON_MESSAGE_ERROR" /* ON_MESSAGE_ERROR */,
      message: `failed to on message`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OnCloseError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "ON_CLOSE_ERROR" /* ON_CLOSE_ERROR */,
      message: `failed to on close`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static OnErrorError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "ON_ERROR_ERROR" /* ON_ERROR_ERROR */,
      message: `failed to on error`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
}
exports.ChannelErrors = ChannelErrors;