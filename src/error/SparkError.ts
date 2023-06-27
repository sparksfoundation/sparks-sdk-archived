import { utcEpochTimestamp } from "../common";
import { AgentErrorName } from "./agent";
import { ChannelErrorName } from "./channel";
import { CipherErrorName } from "./cipher";
import { ControllerErrorName } from "./controller";
import { HasherErrorName } from "./hasher";
import { SignerErrorName } from "./signer";

export type SparkErrorMessage = string;                 // error message describing the error
export type SparkErrorTimestampe = number;              // utc epoch time in ms
export type SparkErrorMetadata = Record<string, any>;   // additional metadata about the error
export type SparkErrorName = AgentErrorName | SignerErrorName | CipherErrorName | ControllerErrorName | HasherErrorName | ChannelErrorName;

export type SparkErrorParams = {
  name?: SparkErrorName;
  message?: SparkErrorMessage;
  metadata?: SparkErrorMetadata;
  stack?: Error['stack'];
}

export class SparkError {
  public name: SparkErrorName;
  public message: SparkErrorMessage;
  public timestamp: SparkErrorTimestampe;
  public metadata: SparkErrorMetadata;
  public stack: Error['stack'];

  constructor(error: SparkErrorParams) {
    const { name, message = '', metadata = {}, stack } = error;
    this.name = name;
    this.message = message;
    this.timestamp = utcEpochTimestamp();
    this.metadata = { ...metadata };
    if (error instanceof Error) {
      this.stack = stack;
    }
  }
}