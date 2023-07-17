import { SparkError } from "./SparkError.mjs";
export var HasherErrorType = /* @__PURE__ */ ((HasherErrorType2) => {
  HasherErrorType2["HASHING_ERROR"] = "HASHING_ERROR";
  return HasherErrorType2;
})(HasherErrorType || {});
export class HasherErrors {
  static HashingFailure({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "HASHING_ERROR" /* HASHING_ERROR */,
      message: `failed to hash data`,
      metadata: { ...metadata },
      stack
    });
  }
}
