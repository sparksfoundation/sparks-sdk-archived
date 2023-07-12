import { SparkError } from "./SparkError.mjs";
export var CipherErrorType = /* @__PURE__ */ ((CipherErrorType2) => {
  CipherErrorType2["GET_ENCRYPTION_PUBLIC_KEY_ERROR"] = "GET_ENCRYPTION_PUBLIC_KEY_ERROR";
  CipherErrorType2["GET_ENCRYPTION_SECRET_KEY_ERROR"] = "GET_ENCRYPTION_SECRET_KEY_ERROR";
  CipherErrorType2["GET_ENCRYPTION_KEYPAIR_ERROR"] = "GET_ENCRYPTION_KEYPAIR_ERROR";
  CipherErrorType2["SET_ENCRYPTION_KEYPAIR_ERROR"] = "SET_ENCRYPTION_KEYPAIR_ERROR";
  CipherErrorType2["GENERATE_ENCRYPTION_KEY_PAIR_ERROR"] = "GENERATE_ENCRYPTION_KEY_PAIR_ERROR";
  CipherErrorType2["GENERATE_ENCRYPTION_SHARED_KEY_ERROR"] = "GENERATE_ENCRYPTION_SHARED_KEY_ERROR";
  CipherErrorType2["ENCRYPT_ERROR"] = "ENCRYPT_ERROR";
  CipherErrorType2["DECRYPT_ERROR"] = "DECRYPT_ERROR";
  return CipherErrorType2;
})(CipherErrorType || {});
export class CipherErrors {
  static GetCipherPublicKeyError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "GET_ENCRYPTION_PUBLIC_KEY_ERROR" /* GET_ENCRYPTION_PUBLIC_KEY_ERROR */,
      message: `failed to get cipher public key$`,
      metadata: { ...metadata },
      stack
    });
  }
  static GetCipherSecretKeyError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "GET_ENCRYPTION_SECRET_KEY_ERROR" /* GET_ENCRYPTION_SECRET_KEY_ERROR */,
      message: `failed to get cipher secret key$`,
      metadata: { ...metadata },
      stack
    });
  }
  static GetEncryptionKeypairError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "GET_ENCRYPTION_KEYPAIR_ERROR" /* GET_ENCRYPTION_KEYPAIR_ERROR */,
      message: `failed to get cipher keypair$`,
      metadata: { ...metadata },
      stack
    });
  }
  static SetEncryptionKeypairError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "SET_ENCRYPTION_KEYPAIR_ERROR" /* SET_ENCRYPTION_KEYPAIR_ERROR */,
      message: `failed to set cipher keypair$`,
      metadata: { ...metadata },
      stack
    });
  }
  static GenerateCipherKeyPairError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "GENERATE_ENCRYPTION_KEY_PAIR_ERROR" /* GENERATE_ENCRYPTION_KEY_PAIR_ERROR */,
      message: `failed to generate cipher keypair$`,
      metadata: { ...metadata },
      stack
    });
  }
  static GenerateEncryptionSharedKeyError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "GENERATE_ENCRYPTION_SHARED_KEY_ERROR" /* GENERATE_ENCRYPTION_SHARED_KEY_ERROR */,
      message: `failed to generate cipher shared key$`,
      metadata: { ...metadata },
      stack
    });
  }
  static EncryptError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "ENCRYPT_ERROR" /* ENCRYPT_ERROR */,
      message: `failed to encrypt$`,
      metadata: { ...metadata },
      stack
    });
  }
  static DecryptError({ metadata = {}, stack } = {}) {
    return new SparkError({
      type: "DECRYPT_ERROR" /* DECRYPT_ERROR */,
      message: `failed to decrypt$`,
      metadata: { ...metadata },
      stack
    });
  }
}
