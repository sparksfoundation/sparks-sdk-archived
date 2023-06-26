import { CipherErrorType } from "../cipher/types";
import { ControllerErrorType } from "../controller/types";
import { SignerErrorType } from "../signer/types";
import { HasherErrorType } from "../hasher/types";

// errors
export type ErrorMessage = string;               // error message describing the error
export type ErrorTimestamp = number;             // utc epoch time in ms
export type ErrorId = string;                    // unique id for the error
export type ErrorMetadata = Record<string, any>; // additional metadata about the error

export type ErrorType = SignerErrorType | CipherErrorType | ControllerErrorType | HasherErrorType;

export interface ErrorInterface {
  type: ErrorType;
  message: ErrorMessage;
  timestamp: ErrorTimestamp;
  metadata: ErrorMetadata;
}

export class SparkError implements ErrorInterface {
    public type: ErrorType;
    public message: ErrorMessage;
    public timestamp: ErrorTimestamp;
    public metadata: ErrorMetadata;

    constructor(params: { type: ErrorType, message: ErrorMessage, metadata?: ErrorMetadata }) {
        const { type, message, metadata = {}} = params;
        this.type = type;
        this.message = message;
        this.timestamp = Date.now();
        this.metadata = metadata;
    }
}