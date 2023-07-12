import { AgentErrorType } from "./agent";
import { ChannelErrorType } from "./channel";
import { CipherErrorType } from "./cipher";
import { ControllerErrorType } from "./controller";
import { HasherErrorType } from "./hasher";
import { SignerErrorType } from "./signer";
export type SparkErrorMessage = string;
export type SparkErrorTimestampe = number;
export type SparkErrorMetadata = Record<string, any>;
export type SparkErrorType = AgentErrorType | SignerErrorType | CipherErrorType | ControllerErrorType | HasherErrorType | ChannelErrorType;
export type SparkErrorStack = string;
export type SparkErrorParams = {
    type?: SparkErrorType;
    message?: SparkErrorMessage;
    metadata?: SparkErrorMetadata;
    stack?: SparkErrorStack;
};
export declare class SparkError {
    type: SparkErrorType;
    message: SparkErrorMessage;
    timestamp: SparkErrorTimestampe;
    metadata: SparkErrorMetadata;
    stack: SparkErrorStack;
    constructor(error: SparkErrorParams);
}
