"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HasherErrors = exports.HasherErrorName = void 0;
var _SparkError = require("./SparkError.cjs");
var HasherErrorName = /* @__PURE__ */(HasherErrorName2 => {
  HasherErrorName2["HASHING_ERROR"] = "HASHING_ERROR";
  return HasherErrorName2;
})(HasherErrorName || {});
exports.HasherErrorName = HasherErrorName;
class HasherErrors {
  static HashingFailure({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      name: "HASHING_ERROR" /* HASHING_ERROR */,
      message: `failed to hash data`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
}
exports.HasherErrors = HasherErrors;