import { ErrorInterface, ErrorMessage, ErrorMetadata, ErrorTimestamp, ErrorType } from "../types";

export const parseJSON = (data): Record<string,any> | void => {
    try {
        return JSON.parse(data);
    }
    catch (e) {
        return;
    }
}

export class Fail implements ErrorInterface {
  public type: ErrorType.Any;
  public message: ErrorMessage;
  public timestamp: ErrorTimestamp;
  public metadata: ErrorMetadata;

  constructor({ type, message, metadata }: { type: ErrorType.Any, message: ErrorMessage, metadata?: ErrorMetadata }) {
      this.type = type;
      this.message = message;
      this.timestamp = Date.now();
      this.metadata = metadata || {};
  }

}