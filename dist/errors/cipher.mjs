import { SparkError } from "./index.mjs";
export var CipherErrorType = /* @__PURE__ */ ((CipherErrorType2) => {
  CipherErrorType2["INVALID_PUBLIC_ENCRYPTION_KEY"] = "INVALID_PUBLIC_ENCRYPTION_KEY";
  CipherErrorType2["INVALID_SECRET_ENCRYPTION_KEY"] = "INVALID_SECRET_ENCRYPTION_KEY";
  CipherErrorType2["INVALID_ENCRYPTION_KEYPAIR"] = "INVALID_ENCRYPTION_KEYPAIR";
  CipherErrorType2["GENERATE_ENCRYPTION_KEYPAIR_ERROR"] = "GENERATE_ENCRYPTION_KEYPAIR_ERROR";
  CipherErrorType2["GENERATE_SHARED_ENCRYPTION_KEY_ERROR"] = "GENERATE_SHARED_ENCRYPTION_KEY_ERROR";
  CipherErrorType2["ENCRYPTION_FAILURE"] = "ENCRYPTION_FAILURE";
  CipherErrorType2["DECRYPTION_FAILURE"] = "DECRYPTION_FAILURE";
  return CipherErrorType2;
})(CipherErrorType || {});
export class CipherErrorFactory {
  constructor(cipher) {
    this.cipher = cipher;
  }
  InvalidPublicKey() {
    return new SparkError({
      type: "INVALID_PUBLIC_ENCRYPTION_KEY" /* INVALID_PUBLIC_ENCRYPTION_KEY */,
      message: "invalid public encryption key",
      metadata: { cipher: this.cipher }
    });
  }
  InvalidSecretKey() {
    return new SparkError({
      type: "INVALID_SECRET_ENCRYPTION_KEY" /* INVALID_SECRET_ENCRYPTION_KEY */,
      message: "invalid secret encryption key",
      metadata: { cipher: this.cipher }
    });
  }
  InvalidKeyPair() {
    return new SparkError({
      type: "INVALID_ENCRYPTION_KEYPAIR" /* INVALID_ENCRYPTION_KEYPAIR */,
      message: `invalid encryption key pair`,
      metadata: { cipher: this.cipher }
    });
  }
  KeyPairFailure(reason) {
    return new SparkError({
      type: "GENERATE_ENCRYPTION_KEYPAIR_ERROR" /* GENERATE_ENCRYPTION_KEYPAIR_ERROR */,
      message: `failed to generate encryption key pair${reason ? `: ${reason}` : ""}`,
      metadata: { cipher: this.cipher }
    });
  }
  SharedKeyFailure(reason) {
    return new SparkError({
      type: "GENERATE_SHARED_ENCRYPTION_KEY_ERROR" /* GENERATE_SHARED_ENCRYPTION_KEY_ERROR */,
      message: `failed to generate shared encryption key${reason ? `: ${reason}` : ""}`,
      metadata: { cipher: this.cipher }
    });
  }
  EncryptionFailure(reason) {
    return new SparkError({
      type: "ENCRYPTION_FAILURE" /* ENCRYPTION_FAILURE */,
      message: `failed to encrypt data${reason ? `: ${reason}` : ""}`,
      metadata: { cipher: this.cipher }
    });
  }
  DecryptionFailure(reason) {
    return new SparkError({
      type: "DECRYPTION_FAILURE" /* DECRYPTION_FAILURE */,
      message: `failed to decrypt data${reason ? `: ${reason}` : ""}`,
      metadata: { cipher: this.cipher }
    });
  }
}
