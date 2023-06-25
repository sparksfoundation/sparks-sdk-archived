export type ErrorMessage = string;               // error message describing the error
export type ErrorTimestamp = number;             // utc epoch time in ms
export type ErrorId = string;                    // unique id for the error
export type ErrorMetadata = Record<string, any>; // additional metadata about the error

import { SignerErrorType } from "../errors/signer";
import { CipherErrorType } from "../errors/cipher";

export namespace ErrorType {
  export import Signer = SignerErrorType;
  export import Cipher = CipherErrorType;

  export enum Generic {
    UNEXPECTED = "UNEXPECTED",
  }

  export type Any = Signer | Cipher | Generic;
}

export interface ErrorInterface {
  type: ErrorType.Any;
  message: ErrorMessage;
  timestamp: ErrorTimestamp;
  metadata: ErrorMetadata;
}
