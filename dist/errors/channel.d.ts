import { SparkError, SparkErrorParams } from "./SparkError";
export declare enum ChannelErrorType {
    REQUEST_ACTION_ERROR = "REQUEST_ACTION_ERROR",
    HANDLE_RESPONSE_ERROR = "HANDLE_RESPONSE_ERROR",
    DISPATCH_REQUEST_ERROR = "DISPATCH_REQUEST_ERROR",
    DISPATCH_REQUEST_TIMEOUT_ERROR = "DISPATCH_REQUEST_TIMEOUT_ERROR"
}
export interface ChannelError extends SparkError {
    type: ChannelErrorType;
}
export declare class ChannelError extends SparkError implements ChannelError {
    constructor(params: SparkErrorParams);
}
export declare class ChannelErrors {
    static RequestActionError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static HandleResponseError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static DispatchRequestError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static DispatchRequestTimeoutError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
}
