import { utcEpochTimestamp } from "../utilities/index.mjs";
export class SparkError {
  constructor(error) {
    const { type, message = "", metadata = {}, stack } = error;
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
