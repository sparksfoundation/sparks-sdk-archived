import { SparkError } from "./index.mjs";
export var SignerErrorType = /* @__PURE__ */ ((SignerErrorType2) => {
  SignerErrorType2["INVALID_PUBLIC_SIGNING_KEY"] = "INVALID_PUBLIC_SIGNING_KEY";
  SignerErrorType2["INVALID_SECRET_SIGNING_KEY"] = "INVALID_SECRET_SIGNING_KEY";
  SignerErrorType2["INVALID_SIGNING_KEY_PAIR"] = "INVALID_SIGNING_KEY_PAIR";
  SignerErrorType2["GENERATE_SIGNING_KEYPAIR_ERROR"] = "GENERATE_SIGNING_KEYPAIR_ERROR";
  SignerErrorType2["SIGNING_FAILURE"] = "SIGNING_FAILURE";
  SignerErrorType2["SIGNATURE_OPEN_FAILURE"] = "SIGNATURE_OPEN_FAILURE";
  SignerErrorType2["SEAL_DATA_FAILURE"] = "SEAL_DATA_FAILURE";
  SignerErrorType2["SIGNATURE_VERIFICATION_FAILURE"] = "SIGNATURE_VERIFICATION_FAILURE";
  return SignerErrorType2;
})(SignerErrorType || {});
export class SignerErrorFactory {
  constructor(signer) {
    this.signer = signer;
  }
  // no additional reasons for getters
  InvalidPublicKey() {
    return new SparkError({
      type: "INVALID_PUBLIC_SIGNING_KEY" /* INVALID_PUBLIC_SIGNING_KEY */,
      message: "invalid public signing key",
      metadata: { signer: this.signer }
    });
  }
  InvalidSecretKey() {
    return new SparkError({
      type: "INVALID_SECRET_SIGNING_KEY" /* INVALID_SECRET_SIGNING_KEY */,
      message: "invalid secret signing key",
      metadata: { signer: this.signer }
    });
  }
  InvalidKeyPair() {
    return new SparkError({
      type: "INVALID_SIGNING_KEY_PAIR" /* INVALID_SIGNING_KEY_PAIR */,
      message: `invalid signing key pair`,
      metadata: { signer: this.signer }
    });
  }
  KeyPairFailure(reason) {
    return new SparkError({
      type: "GENERATE_SIGNING_KEYPAIR_ERROR" /* GENERATE_SIGNING_KEYPAIR_ERROR */,
      message: `failed to generate signing key pair${reason ? `: ${reason}` : ""}`,
      metadata: { signer: this.signer }
    });
  }
  SigningFailure(reason) {
    return new SparkError({
      type: "SIGNING_FAILURE" /* SIGNING_FAILURE */,
      message: `failed to sign data${reason ? `: ${reason}` : ""}`,
      metadata: { signer: this.signer }
    });
  }
  SignatureOpenFailure(reason) {
    return new SparkError({
      type: "SIGNATURE_OPEN_FAILURE" /* SIGNATURE_OPEN_FAILURE */,
      message: `failed to open signature${reason ? `: ${reason}` : ""}`,
      metadata: { signer: this.signer }
    });
  }
  SealDataFailure(reason) {
    return new SparkError({
      type: "SEAL_DATA_FAILURE" /* SEAL_DATA_FAILURE */,
      message: `failed to seal data${reason ? `: ${reason}` : ""}`,
      metadata: { signer: this.signer }
    });
  }
  SignatureVerificationFailure(reason) {
    return new SparkError({
      type: "SIGNATURE_VERIFICATION_FAILURE" /* SIGNATURE_VERIFICATION_FAILURE */,
      message: `failed to verify signature${reason ? `: ${reason}` : ""}`,
      metadata: { signer: this.signer }
    });
  }
}
