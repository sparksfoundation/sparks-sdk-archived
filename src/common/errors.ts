import { AgentErrorType } from "../agent/types";
import { CipherErrorType } from "../cipher/types";
import { ChannelErrorType } from "../channel/types/errors";
import { ControllerErrorType } from "../controller/types";
import { SignerErrorType } from "../signer/types";
import { HasherErrorType } from "../hasher/types";
import { utcEpochTimestamp } from ".";

// errors
export type ErrorMessage = string;               // error message describing the error
export type ErrorTimestamp = number;             // utc epoch time in ms
export type ErrorId = string;                    // unique id for the error
export type ErrorMetadata = Record<string, any>; // additional metadata about the error

export type ErrorType = AgentErrorType | SignerErrorType | CipherErrorType | ControllerErrorType | HasherErrorType | ChannelErrorType;

export interface ErrorInterface {
  type: ErrorType;
  message: ErrorMessage;
  timestamp: ErrorTimestamp;
  metadata: ErrorMetadata;
  previous?: ErrorInterface;
}

export class SparkError implements ErrorInterface {
  public type: ErrorType;
  public message: ErrorMessage;
  public timestamp: ErrorTimestamp;
  public metadata: ErrorMetadata;
  public previous?: SparkError;

  constructor(params: { type: ErrorType, message: ErrorMessage, metadata?: ErrorMetadata }) {
    const { type, message, metadata = {} } = params;
    this.type = type;
    this.message = message;
    this.timestamp = utcEpochTimestamp();
    this.metadata = { ...metadata };
  }

  public static is(obj: any): obj is SparkError {
    return obj instanceof SparkError;
  }

  public static get(...objs): ErrorInterface | null {
    return objs.reduce((acc, obj) => {
      if (SparkError.is(obj)) {
        if (acc) acc.previous = obj;
        else acc = obj;
      }
      return acc;
    }, null);
  }
}