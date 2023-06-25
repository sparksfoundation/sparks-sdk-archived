export class SparkError {
  constructor(params) {
    const { type, message, metadata = {} } = params;
    this.type = type;
    this.message = message;
    this.timestamp = Date.now();
    this.metadata = metadata;
  }
}
