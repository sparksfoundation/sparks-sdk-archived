"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SignerErrors = exports.SignerErrorType = void 0;
var _SparkError = require("./SparkError.cjs");
var SignerErrorType = /* @__PURE__ */(SignerErrorType2 => {
  SignerErrorType2["GET_SIGNING_PUBLIC_KEY_ERROR"] = "GET_SIGNING_PUBLIC_KEY_ERROR";
  SignerErrorType2["GET_SIGNING_SECRET_KEY_ERROR"] = "GET_SIGNING_SECRET_KEY_ERROR";
  SignerErrorType2["GET_SIGNING_KEY_PAIR_ERROR"] = "GET_SIGNING_KEY_PAIR_ERROR";
  SignerErrorType2["SET_SIGNING_KEY_PAIR_ERROR"] = "SET_SIGNING_KEY_PAIR_ERROR";
  SignerErrorType2["GENERATE_SIGNING_KEY_PAIR_ERROR"] = "GENERATE_SIGNING_KEY_PAIR_ERROR";
  SignerErrorType2["MESSAGE_SIGNING_ERROR"] = "MESSAGE_SIGNING_ERROR";
  SignerErrorType2["SIGNATURE_VERIFICATION_ERROR"] = "SIGNATURE_VERIFICATION_ERROR";
  SignerErrorType2["MESSAGE_SEALING_ERROR"] = "MESSAGE_SEALING_ERROR";
  SignerErrorType2["SIGNATURE_OPENING_ERROR"] = "SIGNATURE_OPENING_ERROR";
  return SignerErrorType2;
})(SignerErrorType || {});
exports.SignerErrorType = SignerErrorType;
class SignerErrors {
  static GetSignerPublicKeyError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      type: "GET_SIGNING_PUBLIC_KEY_ERROR" /* GET_SIGNING_PUBLIC_KEY_ERROR */,
      message: `failed to get signer public key`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static GetSignerSecretKeyError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      type: "GET_SIGNING_SECRET_KEY_ERROR" /* GET_SIGNING_SECRET_KEY_ERROR */,
      message: `failed to get signer secret key`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static GetSignerKeyPairError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      type: "GET_SIGNING_KEY_PAIR_ERROR" /* GET_SIGNING_KEY_PAIR_ERROR */,
      message: `failed to get signer key pair`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static SetSignerKeyPairError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      type: "SET_SIGNING_KEY_PAIR_ERROR" /* SET_SIGNING_KEY_PAIR_ERROR */,
      message: `failed to set signer key pair`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static GenerateSignerKeyPairError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      type: "GENERATE_SIGNING_KEY_PAIR_ERROR" /* GENERATE_SIGNING_KEY_PAIR_ERROR */,
      message: `failed to generate signer key pair`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static MessageSigningError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      type: "MESSAGE_SIGNING_ERROR" /* MESSAGE_SIGNING_ERROR */,
      message: `failed to sign message`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static SignatureVerificationError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      type: "SIGNATURE_VERIFICATION_ERROR" /* SIGNATURE_VERIFICATION_ERROR */,
      message: `failed to verify signature`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static MessageSealingError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      type: "MESSAGE_SEALING_ERROR" /* MESSAGE_SEALING_ERROR */,
      message: `failed to seal message`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
  static SignatureOpeningError({
    metadata = {},
    stack
  } = {}) {
    return new _SparkError.SparkError({
      type: "SIGNATURE_OPENING_ERROR" /* SIGNATURE_OPENING_ERROR */,
      message: `failed to open signature`,
      metadata: {
        ...metadata
      },
      stack
    });
  }
}
exports.SignerErrors = SignerErrors;