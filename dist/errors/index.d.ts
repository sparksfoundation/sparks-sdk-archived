import { ErrorInterface, ErrorMessage, ErrorMetadata, ErrorTimestamp, ErrorType } from "../types";
export declare class SparkError implements ErrorInterface {
    type: ErrorType.Any;
    message: ErrorMessage;
    timestamp: ErrorTimestamp;
    metadata: ErrorMetadata;
    constructor(params: {
        type: ErrorType.Any;
        message: ErrorMessage;
        metadata?: ErrorMetadata;
    });
}
