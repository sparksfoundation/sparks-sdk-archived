import { SparkError } from "../errors/index.mjs";
import { ErrorType } from "../types/index.mjs";
export class Controller {
  destroy(...args) {
    return Promise.reject(new SparkError({
      message: "Not implemented",
      type: ErrorType.Generic.UNEXPECTED
    }));
  }
  get identifier() {
    return this.identifier;
  }
  get keyEventLog() {
    return this.keyEventLog;
  }
  incept(...args) {
    return Promise.reject(new SparkError({
      message: "Not implemented",
      type: ErrorType.Generic.UNEXPECTED
    }));
  }
  rotate(...args) {
    return Promise.reject(new SparkError({
      message: "Not implemented",
      type: ErrorType.Generic.UNEXPECTED
    }));
  }
}
