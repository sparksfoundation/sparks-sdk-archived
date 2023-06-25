import { SparkError } from "../common/errors"
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
  }
}

export default CipherErrorFactory;