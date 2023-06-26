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
  }
}

export default CipherErrorFactory;