export type ErrorMessage = string;
export type ErrorTimestamp = number;
export type ErrorId = string;
export type ErrorMetadata = Record<string, any>;
import { SignerErrorType } from "../errors/signer";
import { CipherErrorType } from "../errors/cipher";
export declare namespace ErrorType {
    export import Signer = SignerErrorType;
    export import Cipher = CipherErrorType;
    enum Generic {
        UNEXPECTED = "UNEXPECTED"
    }
    type Any = Signer | Cipher | Generic;
}
export interface ErrorInterface {
    type: ErrorType.Any;
    message: ErrorMessage;
    timestamp: ErrorTimestamp;
    metadata: ErrorMetadata;
}
