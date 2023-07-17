import { SparkError } from "./SparkError.mjs";
export var ControllerErrorType = /* @__PURE__ */ ((ControllerErrorType2) => {
  ControllerErrorType2["GET_IDENTIFIER_ERROR"] = "GET_IDENTIFIER_ERROR";
  ControllerErrorType2["GET_KEY_EVENT_LOG_ERROR"] = "GET_KEY_EVENT_LOG_ERROR";
  ControllerErrorType2["INCEPTION_ERROR"] = "INCEPTION_ERROR";
  ControllerErrorType2["ROTATION_ERROR"] = "ROTATION_ERROR";
  ControllerErrorType2["DESTROY_ERROR"] = "DESTROY_ERROR";
  ControllerErrorType2["KEY_EVENT_CREATION_ERROR"] = "KEY_EVENT_CREATION_ERROR";
  ControllerErrorType2["SPARK_INSTANCE_ALREADY_SET"] = "SPARK_INSTANCE_ALREADY_SET";
  return ControllerErrorType2;
})(ControllerErrorType || {});
export class ControllerErrors {
  static GetIdentifierError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "GET_IDENTIFIER_ERROR" /* GET_IDENTIFIER_ERROR */,
      message: `failed to get identifier`,
      metadata: { ...metadata },
      stack
    });
  }
  static GetKeyEventLogError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "GET_KEY_EVENT_LOG_ERROR" /* GET_KEY_EVENT_LOG_ERROR */,
      message: `failed to get key event log`,
      metadata: { ...metadata },
      stack
    });
  }
  static InceptionError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "INCEPTION_ERROR" /* INCEPTION_ERROR */,
      message: `failed to perform inception`,
      metadata: { ...metadata },
      stack
    });
  }
  static RotationError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "ROTATION_ERROR" /* ROTATION_ERROR */,
      message: `failed to perform rotation`,
      metadata: { ...metadata },
      stack
    });
  }
  static DestroyError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "DESTROY_ERROR" /* DESTROY_ERROR */,
      message: `failed to perform destroy`,
      metadata: { ...metadata },
      stack
    });
  }
  static KeyEventCreationError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "KEY_EVENT_CREATION_ERROR" /* KEY_EVENT_CREATION_ERROR */,
      message: `failed to create key event`,
      metadata: { ...metadata },
      stack
    });
  }
  static SparkInstanceAlreadySet({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "SPARK_INSTANCE_ALREADY_SET" /* SPARK_INSTANCE_ALREADY_SET */,
      message: `spark instance already set`,
      metadata: { ...metadata },
      stack
    });
  }
}
