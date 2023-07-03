import { SparkError } from "./SparkError.mjs";
export var ControllerErrorName = /* @__PURE__ */ ((ControllerErrorName2) => {
  ControllerErrorName2["GET_IDENTIFIER_ERROR"] = "GET_IDENTIFIER_ERROR";
  ControllerErrorName2["GET_KEY_EVENT_LOG_ERROR"] = "GET_KEY_EVENT_LOG_ERROR";
  ControllerErrorName2["INCEPTION_ERROR"] = "INCEPTION_ERROR";
  ControllerErrorName2["ROTATION_ERROR"] = "ROTATION_ERROR";
  ControllerErrorName2["DESTROY_ERROR"] = "DESTROY_ERROR";
  ControllerErrorName2["KEY_EVENT_CREATION_ERROR"] = "KEY_EVENT_CREATION_ERROR";
  ControllerErrorName2["SPARK_INSTANCE_ALREADY_SET"] = "SPARK_INSTANCE_ALREADY_SET";
  return ControllerErrorName2;
})(ControllerErrorName || {});
export class ControllerErrors {
  static GetIdentifierError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GET_IDENTIFIER_ERROR" /* GET_IDENTIFIER_ERROR */,
      message: `failed to get identifier`,
      metadata: { ...metadata },
      stack
    });
  }
  static GetKeyEventLogError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GET_KEY_EVENT_LOG_ERROR" /* GET_KEY_EVENT_LOG_ERROR */,
      message: `failed to get key event log`,
      metadata: { ...metadata },
      stack
    });
  }
  static InceptionError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "INCEPTION_ERROR" /* INCEPTION_ERROR */,
      message: `failed to perform inception`,
      metadata: { ...metadata },
      stack
    });
  }
  static RotationError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "ROTATION_ERROR" /* ROTATION_ERROR */,
      message: `failed to perform rotation`,
      metadata: { ...metadata },
      stack
    });
  }
  static DestroyError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "DESTROY_ERROR" /* DESTROY_ERROR */,
      message: `failed to perform destroy`,
      metadata: { ...metadata },
      stack
    });
  }
  static KeyEventCreationError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "KEY_EVENT_CREATION_ERROR" /* KEY_EVENT_CREATION_ERROR */,
      message: `failed to create key event`,
      metadata: { ...metadata },
      stack
    });
  }
  static SparkInstanceAlreadySet({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "SPARK_INSTANCE_ALREADY_SET" /* SPARK_INSTANCE_ALREADY_SET */,
      message: `spark instance already set`,
      metadata: { ...metadata },
      stack
    });
  }
}
