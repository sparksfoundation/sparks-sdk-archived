import { SignerErrorType } from "../errors/signer.mjs";
import { CipherErrorType } from "../errors/cipher.mjs";
export var ErrorType;
((ErrorType2) => {
  ErrorType2.Signer = SignerErrorType;
  ErrorType2.Cipher = CipherErrorType;
  let Generic;
  ((Generic2) => {
    Generic2["UNEXPECTED"] = "UNEXPECTED";
  })(Generic = ErrorType2.Generic || (ErrorType2.Generic = {}));
})(ErrorType || (ErrorType = {}));
