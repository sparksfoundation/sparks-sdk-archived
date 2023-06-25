import { ErrorInterface, ErrorMessage, ErrorMetadata, ErrorTimestamp, ErrorType } from "../types";
export declare const parseJSON: (data: any) => Record<string, any> | void;
export declare class Fail implements ErrorInterface {
    type: ErrorType.Any;
    message: ErrorMessage;
    timestamp: ErrorTimestamp;
    metadata: ErrorMetadata;
    constructor({ type, message, metadata }: {
        type: ErrorType.Any;
        message: ErrorMessage;
        metadata?: ErrorMetadata;
    });
}
