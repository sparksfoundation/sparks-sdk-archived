import { SparkError, SparkErrorParams } from "./SparkError";

export enum ControllerErrorName {
  GET_IDENTIFIER_ERROR = 'GET_IDENTIFIER_ERROR',
  GET_KEY_EVENT_LOG_ERROR = 'GET_KEY_EVENT_LOG_ERROR',
  INCEPTION_ERROR = 'INCEPTION_ERROR',
  ROTATION_ERROR = 'ROTATION_ERROR',
  DESTROY_ERROR = 'DESTROY_ERROR',
  KEY_EVENT_CREATION_ERROR = 'KEY_EVENT_CREATION_ERROR',
  SPARK_INSTANCE_ALREADY_SET = 'SPARK_INSTANCE_ALREADY_SET',
}

export class ControllerErrors {
  public static GetIdentifierError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.GET_IDENTIFIER_ERROR,
      message: `failed to get identifier`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GetKeyEventLogError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.GET_KEY_EVENT_LOG_ERROR,
      message: `failed to get key event log`,
      metadata: { ...metadata },
      stack
    });
  }

  public static InceptionError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.INCEPTION_ERROR,
      message: `failed to perform inception`,
      metadata: { ...metadata },
      stack
    });
  }

  public static RotationError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.ROTATION_ERROR,
      message: `failed to perform rotation`,
      metadata: { ...metadata },
      stack
    });
  }

  public static DestroyError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.DESTROY_ERROR,
      message: `failed to perform destroy`,
      metadata: { ...metadata },
      stack
    });
  }

  public static KeyEventCreationError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.KEY_EVENT_CREATION_ERROR,
      message: `failed to create key event`,
      metadata: { ...metadata },
      stack
    });
  }

  public static SparkInstanceAlreadySet({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.SPARK_INSTANCE_ALREADY_SET,
      message: `spark instance already set`,
      metadata: { ...metadata },
      stack
    });
  }
}