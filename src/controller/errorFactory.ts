import { ErrorMessage, SparkError } from "../common/errors"
import { ControllerErrorType } from "./types"

const CipherErrorFactory = {
  InvalidIdentifier: () => {
    return new SparkError({
      type: ControllerErrorType.INVALID_IDENTIFIER,
      message: 'invalid public encryption key',
    });
  },
  InvalidKeyEventLog: () => {
    return new SparkError({
      type: ControllerErrorType.INVALID_KEY_EVENT_LOG,
      message: 'invalid key event log',
    });
  },
  InceptFailed: () => {
    return new SparkError({
      type: ControllerErrorType.INCEPT_FAILED,
      message: 'incept failed',
    });
  }, 
  KeyEventError: (reason?: ErrorMessage) => {
    return new SparkError({
      type: ControllerErrorType.KEY_EVENT_ERROR,
      message: `key event error${reason? `: ${reason}` : ''}`
    });
  },
  InvalidKeyEventType: () => {
    return new SparkError({
      type: ControllerErrorType.INVALID_KEY_EVENT_TYPE,
      message: 'invalid key event type',
    });
  },
  IdentityDestroyed: () => {
    return new SparkError({
      type: ControllerErrorType.IDENTITY_DESTROYED_ERROR,
      message: 'identity destroyed',
    });
  },
  IdentityAlreadyIncepted: () => {
    return new SparkError({
      type: ControllerErrorType.IDENTITY_INCEPTED_ERROR,
      message: 'identity incepted',
    });
  }, 
  InvalidKeyCommitment: () => {
    return new SparkError({
      type: ControllerErrorType.INVALID_KEY_COMMITMENT,
      message: 'invalid key commitment',
    });
  },
  IdentityNotIncepted: () => {
    return new SparkError({
      type: ControllerErrorType.IDENTITY_NOT_INCEPTED,
      message: 'identity not incepted',
    });
  },
  InvalidKeyPairs: () => {
    return new SparkError({
      type: ControllerErrorType.INVALID_KEY_PAIRS,
      message: 'invalid key pairs',
    });
  }
}

export default CipherErrorFactory;