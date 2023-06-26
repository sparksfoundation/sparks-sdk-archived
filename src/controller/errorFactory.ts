import { ErrorMessage, SparkError } from "../common/errors"
import { ControllerErrorType, ControllerType } from "./types"

export class ControllerErrorFactory {
  private controller: ControllerType;

  constructor(controller) {
    this.controller = controller;
  }

  InvalidIdentifier() {
    return new SparkError({
      type: ControllerErrorType.INVALID_IDENTIFIER,
      message: 'invalid public encryption key',
      metadata: { controller: this.controller }
    });
  }

  InvalidKeyEventLog() {
    return new SparkError({
      type: ControllerErrorType.INVALID_KEY_EVENT_LOG,
      message: 'invalid key event log',
      metadata: { controller: this.controller }
    });
  }

  InceptFailed() {
    return new SparkError({
      type: ControllerErrorType.INCEPT_FAILED,
      message: 'incept failed',
      metadata: { controller: this.controller }
    });
  }

  KeyEventError(reason?: ErrorMessage) {
    return new SparkError({
      type: ControllerErrorType.KEY_EVENT_ERROR,
      message: `key event error${reason? `: ${reason}` : ''}`,
      metadata: { controller: this.controller }
    });
  }

  InvalidKeyEventType() {
    return new SparkError({
      type: ControllerErrorType.INVALID_KEY_EVENT_TYPE,
      message: 'invalid key event type',
      metadata: { controller: this.controller }
    });
  }

  IdentityDestroyed() {
    return new SparkError({
      type: ControllerErrorType.IDENTITY_DESTROYED_ERROR,
      message: 'identity destroyed',
      metadata: { controller: this.controller }
    });
  }

  IdentityAlreadyIncepted() {
    return new SparkError({
      type: ControllerErrorType.IDENTITY_INCEPTED_ERROR,
      message: 'identity incepted',
      metadata: { controller: this.controller }
    });
  }

  InvalidKeyCommitment() {
    return new SparkError({
      type: ControllerErrorType.INVALID_KEY_COMMITMENT,
      message: 'invalid key commitment',
      metadata: { controller: this.controller }
    });
  }

  IdentityNotIncepted() {
    return new SparkError({
      type: ControllerErrorType.IDENTITY_NOT_INCEPTED,
      message: 'identity not incepted',
      metadata: { controller: this.controller }
    });
  }

  InvalidKeyPairs() {
    return new SparkError({
      type: ControllerErrorType.INVALID_KEY_PAIRS,
      message: 'invalid key pairs',
      metadata: { controller: this.controller }
    });
  }

  InvalidSparkInstance() {
    return new SparkError({
      type: ControllerErrorType.INVALID_SPARK_INSTANCE,
      message: 'invalid spark instance',
      metadata: { controller: this.controller }
    });
  }
}
