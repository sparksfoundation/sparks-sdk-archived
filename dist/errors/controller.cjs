"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ControllerErrors = exports.ControllerErrorName = void 0;
var _SparkError = require("./SparkError.cjs");
var ControllerErrorName = /* @__PURE__ */(ControllerErrorName2 => {
  ControllerErrorName2["GET_IDENTIFIER_ERROR"] = "GET_IDENTIFIER_ERROR";
  ControllerErrorName2["GET_KEY_EVENT_LOG_ERROR"] = "GET_KEY_EVENT_LOG_ERROR";
  ControllerErrorName2["INCEPTION_ERROR"] = "INCEPTION_ERROR";
  ControllerErrorName2["ROTATION_ERROR"] = "ROTATION_ERROR";
  ControllerErrorName2["DESTROY_ERROR"] = "DESTROY_ERROR";
  ControllerErrorName2["KEY_EVENT_CREATION_ERROR"] = "KEY_EVENT_CREATION_ERROR";
  ControllerErrorName2["SPARK_INSTANCE_ALREADY_SET"] = "SPARK_INSTANCE_ALREADY_SET";
  return ControllerErrorName2;
})(ControllerErrorName || {});
exports.ControllerErrorName = ControllerErrorName;
class ControllerErrors {
  static GetIdentifierError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "GET_IDENTIFIER_ERROR" /* GET_IDENTIFIER_ERROR */,
      message: `failed to get identifier`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static GetKeyEventLogError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "GET_KEY_EVENT_LOG_ERROR" /* GET_KEY_EVENT_LOG_ERROR */,
      message: `failed to get key event log`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static InceptionError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "INCEPTION_ERROR" /* INCEPTION_ERROR */,
      message: `failed to perform inception`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static RotationError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "ROTATION_ERROR" /* ROTATION_ERROR */,
      message: `failed to perform rotation`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static DestroyError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "DESTROY_ERROR" /* DESTROY_ERROR */,
      message: `failed to perform destroy`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static KeyEventCreationError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "KEY_EVENT_CREATION_ERROR" /* KEY_EVENT_CREATION_ERROR */,
      message: `failed to create key event`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static SparkInstanceAlreadySet({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "SPARK_INSTANCE_ALREADY_SET" /* SPARK_INSTANCE_ALREADY_SET */,
      message: `spark instance already set`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
}
exports.ControllerErrors = ControllerErrors;