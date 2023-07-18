import { SparkError, SparkErrorParams } from "./SparkError";
export declare const ChannelErrorType: {
    readonly REQUEST_ACTION_ERROR: "REQUEST_ACTION_ERROR";
    readonly HANDLE_EVENT_ERROR: "HANDLE_EVENT_ERROR";
    readonly DISPATCH_REQUEST_ERROR: "DISPATCH_REQUEST_ERROR";
    readonly INVALID_EVENT_TYPE_ERROR: "INVALID_EVENT_TYPE_ERROR";
    readonly CONFIRM_TIMEOUT_ERROR: "CONFIRM_TIMEOUT_ERROR";
    readonly CHANNEL_CLOSED_ERROR: "CHANNEL_CLOSED_ERROR";
    readonly OPEN_REJECTED_ERROR: "OPEN_REJECTED_ERROR";
    readonly CHANNEL_NOT_FOUND_ERROR: "CHANNEL_NOT_FOUND_ERROR";
    readonly NO_STREAMS_AVAILABLE_ERROR: "NO_STREAMS_AVAILABLE_ERROR";
};
export type ChannelErrorType = typeof ChannelErrorType[keyof typeof ChannelErrorType];
export interface ChannelError extends SparkError {
    type: ChannelErrorType;
}
export interface ChannelErrorParams extends SparkErrorParams {
    type: ChannelErrorType;
}
export declare class ChannelError extends SparkError implements ChannelError {
    constructor(params: SparkErrorParams);
}
export declare class ChannelErrors {
    static RequestActionError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static HandleEventError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static DispatchRequestError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static InvalidEventTypeError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static ConfirmTimeoutError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static ChannelClosedError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static ChannelNotFoundError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static NoStreamsAvailableError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
    static OpenRejectedError({ metadata, message, stack }?: SparkErrorParams): ChannelError;
}
