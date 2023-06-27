import { SparkError, SparkErrorParams } from "./SparkError";

export enum ControllerErrorName {
  GET_IDENTIFIER_ERROR = 'GET_IDENTIFIER_ERROR',
  GET_KEY_EVENT_LOG_ERROR = 'GET_KEY_EVENT_LOG_ERROR',
  INCEPTION_ERROR = 'INCEPTION_ERROR',
  ROTATION_ERROR = 'ROTATION_ERROR',
  DESTROY_ERROR = 'DESTROY_ERROR',
  KEY_EVENT_CREATION_ERROR = 'KEY_EVENT_CREATION_ERROR',
}

export class ControllerErrors {
  public static GetIdentifierError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.GET_IDENTIFIER_ERROR,
      message: `failed to get identifier${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GetKeyEventLogError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.GET_KEY_EVENT_LOG_ERROR,
      message: `failed to get key event log${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static InceptionError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.INCEPTION_ERROR,
      message: `failed to perform inception${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static RotationError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.ROTATION_ERROR,
      message: `failed to perform rotation${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static DestroyError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.DESTROY_ERROR,
      message: `failed to perform destroy${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static KeyEventCreationError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ControllerErrorName.KEY_EVENT_CREATION_ERROR,
      message: `failed to create key event${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }
}