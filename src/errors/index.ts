import { ErrorInterface, ErrorMessage, ErrorMetadata, ErrorTimestamp, ErrorType } from "../types";


export class SparkError implements ErrorInterface {
    public type: ErrorType.Any;
    public message: ErrorMessage;
    public timestamp: ErrorTimestamp;
    public metadata: ErrorMetadata;

    constructor(params: { type: ErrorType.Any, message: ErrorMessage, metadata?: ErrorMetadata }) {
        const { type, message, metadata = {}} = params;
        this.type = type;
        this.message = message;
        this.timestamp = Date.now();
        this.metadata = metadata;
    }
}