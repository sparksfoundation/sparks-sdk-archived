import { utcEpochTimestamp } from "../utilities";
import { AgentErrorType } from "./agent";
import { ChannelErrorType } from "./channel";
import { CipherErrorType } from "./cipher";
import { ControllerErrorType } from "./controller";
import { HasherErrorType } from "./hasher";
import { SignerErrorType } from "./signer";

export type SparkErrorMessage = string;                 // error message describing the error
export type SparkErrorTimestampe = number;              // utc epoch time in ms
export type SparkErrorMetadata = Record<string, any>;   // additional metadata about the error
export type SparkErrorType = AgentErrorType | SignerErrorType | CipherErrorType | ControllerErrorType | HasherErrorType | ChannelErrorType;
export type SparkErrorStack = string;

export type SparkErrorParams = {
  type?: SparkErrorType;
  message?: SparkErrorMessage;
  metadata?: SparkErrorMetadata;
  stack?: SparkErrorStack;
}

export class SparkError {
  public type: SparkErrorType;
  public message: SparkErrorMessage;
  public timestamp: SparkErrorTimestampe;
  public metadata: SparkErrorMetadata;
  public stack: SparkErrorStack;

  constructor(error: SparkErrorParams) {
    const { type, message = '', metadata = {}, stack } = error;
    this.type = type;
    this.message = message;
    this.timestamp = utcEpochTimestamp();
    this.metadata = { ...metadata };
    this.stack = stack;

    Object.defineProperties(this, {
      stack: { enumerable: true }
    });
  }
}