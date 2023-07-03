import { SparkError } from "./SparkError.mjs";
export var HasherErrorName = /* @__PURE__ */ ((HasherErrorName2) => {
  HasherErrorName2["HASHING_ERROR"] = "HASHING_ERROR";
  return HasherErrorName2;
})(HasherErrorName || {});
export class HasherErrors {
  static HashingFailure({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "HASHING_ERROR" /* HASHING_ERROR */,
      message: `failed to hash data`,
      metadata: { ...metadata },
      stack
    });
  }
}
