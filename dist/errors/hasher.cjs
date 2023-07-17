"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HasherErrors = exports.HasherErrorType = void 0;
var _SparkError = require("./SparkError.cjs");
var HasherErrorType = /* @__PURE__ */(HasherErrorType2 => {
  HasherErrorType2["HASHING_ERROR"] = "HASHING_ERROR";
  return HasherErrorType2;
})(HasherErrorType || {});
exports.HasherErrorType = HasherErrorType;
class HasherErrors {
  static HashingFailure({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      type: "HASHING_ERROR" /* HASHING_ERROR */,
      message: `failed to hash data`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
}
exports.HasherErrors = HasherErrors;