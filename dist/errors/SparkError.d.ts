import { AgentErrorName } from "./agent";
import { ChannelErrorName } from "./channel";
import { CipherErrorName } from "./cipher";
import { ControllerErrorName } from "./controller";
import { HasherErrorName } from "./hasher";
import { SignerErrorName } from "./signer";
export type SparkErrorMessage = string;
export type SparkErrorTimestampe = number;
export type SparkErrorMetadata = Record<string, any>;
export type SparkErrorName = AgentErrorName | SignerErrorName | CipherErrorName | ControllerErrorName | HasherErrorName | ChannelErrorName;
export type SparkErrorStack = string;
export type SparkErrorParams = {
    name?: SparkErrorName;
    message?: SparkErrorMessage;
    metadata?: SparkErrorMetadata;
    stack?: SparkErrorStack;
};
export declare class SparkError {
    name: SparkErrorName;
    message: SparkErrorMessage;
    timestamp: SparkErrorTimestampe;
    metadata: SparkErrorMetadata;
    stack: SparkErrorStack;
    constructor(error: SparkErrorParams);
}
