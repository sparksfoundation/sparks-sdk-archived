import { SparkError } from "./SparkError.mjs";
export var SignerErrorName = /* @__PURE__ */ ((SignerErrorName2) => {
  SignerErrorName2["GET_SIGNING_PUBLIC_KEY_ERROR"] = "GET_SIGNING_PUBLIC_KEY_ERROR";
  SignerErrorName2["GET_SIGNING_SECRET_KEY_ERROR"] = "GET_SIGNING_SECRET_KEY_ERROR";
  SignerErrorName2["GET_SIGNING_KEY_PAIR_ERROR"] = "GET_SIGNING_KEY_PAIR_ERROR";
  SignerErrorName2["SET_SIGNING_KEY_PAIR_ERROR"] = "SET_SIGNING_KEY_PAIR_ERROR";
  SignerErrorName2["GENERATE_SIGNING_KEY_PAIR_ERROR"] = "GENERATE_SIGNING_KEY_PAIR_ERROR";
  SignerErrorName2["MESSAGE_SIGNING_ERROR"] = "MESSAGE_SIGNING_ERROR";
  SignerErrorName2["SIGNATURE_VERIFICATION_ERROR"] = "SIGNATURE_VERIFICATION_ERROR";
  SignerErrorName2["MESSAGE_SEALING_ERROR"] = "MESSAGE_SEALING_ERROR";
  SignerErrorName2["SIGNATURE_OPENING_ERROR"] = "SIGNATURE_OPENING_ERROR";
  return SignerErrorName2;
})(SignerErrorName || {});
export class SignerErrors {
  static GetSignerPublicKeyError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GET_SIGNING_PUBLIC_KEY_ERROR" /* GET_SIGNING_PUBLIC_KEY_ERROR */,
      message: `failed to get signer public key`,
      metadata: { ...metadata },
      stack
    });
  }
  static GetSignerSecretKeyError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GET_SIGNING_SECRET_KEY_ERROR" /* GET_SIGNING_SECRET_KEY_ERROR */,
      message: `failed to get signer secret key`,
      metadata: { ...metadata },
      stack
    });
  }
  static GetSignerKeyPairError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GET_SIGNING_KEY_PAIR_ERROR" /* GET_SIGNING_KEY_PAIR_ERROR */,
      message: `failed to get signer key pair`,
      metadata: { ...metadata },
      stack
    });
  }
  static SetSignerKeyPairError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "SET_SIGNING_KEY_PAIR_ERROR" /* SET_SIGNING_KEY_PAIR_ERROR */,
      message: `failed to set signer key pair`,
      metadata: { ...metadata },
      stack
    });
  }
  static GenerateSignerKeyPairError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GENERATE_SIGNING_KEY_PAIR_ERROR" /* GENERATE_SIGNING_KEY_PAIR_ERROR */,
      message: `failed to generate signer key pair`,
      metadata: { ...metadata },
      stack
    });
  }
  static MessageSigningError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "MESSAGE_SIGNING_ERROR" /* MESSAGE_SIGNING_ERROR */,
      message: `failed to sign message`,
      metadata: { ...metadata },
      stack
    });
  }
  static SignatureVerificationError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "SIGNATURE_VERIFICATION_ERROR" /* SIGNATURE_VERIFICATION_ERROR */,
      message: `failed to verify signature`,
      metadata: { ...metadata },
      stack
    });
  }
  static MessageSealingError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "MESSAGE_SEALING_ERROR" /* MESSAGE_SEALING_ERROR */,
      message: `failed to seal message`,
      metadata: { ...metadata },
      stack
    });
  }
  static SignatureOpeningError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "SIGNATURE_OPENING_ERROR" /* SIGNATURE_OPENING_ERROR */,
      message: `failed to open signature`,
      metadata: { ...metadata },
      stack
    });
  }
}
