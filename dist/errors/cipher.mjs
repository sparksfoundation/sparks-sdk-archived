import { SparkError } from "./SparkError.mjs";
export var CipherErrorName = /* @__PURE__ */ ((CipherErrorName2) => {
  CipherErrorName2["GET_ENCRYPTION_PUBLIC_KEY_ERROR"] = "GET_ENCRYPTION_PUBLIC_KEY_ERROR";
  CipherErrorName2["GET_ENCRYPTION_SECRET_KEY_ERROR"] = "GET_ENCRYPTION_SECRET_KEY_ERROR";
  CipherErrorName2["GET_ENCRYPTION_KEYPAIR_ERROR"] = "GET_ENCRYPTION_KEYPAIR_ERROR";
  CipherErrorName2["SET_ENCRYPTION_KEYPAIR_ERROR"] = "SET_ENCRYPTION_KEYPAIR_ERROR";
  CipherErrorName2["GENERATE_ENCRYPTION_KEY_PAIR_ERROR"] = "GENERATE_ENCRYPTION_KEY_PAIR_ERROR";
  CipherErrorName2["GENERATE_ENCRYPTION_SHARED_KEY_ERROR"] = "GENERATE_ENCRYPTION_SHARED_KEY_ERROR";
  CipherErrorName2["ENCRYPT_ERROR"] = "ENCRYPT_ERROR";
  CipherErrorName2["DECRYPT_ERROR"] = "DECRYPT_ERROR";
  return CipherErrorName2;
})(CipherErrorName || {});
export class CipherErrors {
  static GetCipherPublicKeyError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GET_ENCRYPTION_PUBLIC_KEY_ERROR" /* GET_ENCRYPTION_PUBLIC_KEY_ERROR */,
      message: `failed to get cipher public key$`,
      metadata: { ...metadata },
      stack
    });
  }
  static GetCipherSecretKeyError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GET_ENCRYPTION_SECRET_KEY_ERROR" /* GET_ENCRYPTION_SECRET_KEY_ERROR */,
      message: `failed to get cipher secret key$`,
      metadata: { ...metadata },
      stack
    });
  }
  static GetEncryptionKeypairError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GET_ENCRYPTION_KEYPAIR_ERROR" /* GET_ENCRYPTION_KEYPAIR_ERROR */,
      message: `failed to get cipher keypair$`,
      metadata: { ...metadata },
      stack
    });
  }
  static SetEncryptionKeypairError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "SET_ENCRYPTION_KEYPAIR_ERROR" /* SET_ENCRYPTION_KEYPAIR_ERROR */,
      message: `failed to set cipher keypair$`,
      metadata: { ...metadata },
      stack
    });
  }
  static GenerateCipherKeyPairError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GENERATE_ENCRYPTION_KEY_PAIR_ERROR" /* GENERATE_ENCRYPTION_KEY_PAIR_ERROR */,
      message: `failed to generate cipher keypair$`,
      metadata: { ...metadata },
      stack
    });
  }
  static GenerateEncryptionSharedKeyError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "GENERATE_ENCRYPTION_SHARED_KEY_ERROR" /* GENERATE_ENCRYPTION_SHARED_KEY_ERROR */,
      message: `failed to generate cipher shared key$`,
      metadata: { ...metadata },
      stack
    });
  }
  static EncryptError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "ENCRYPT_ERROR" /* ENCRYPT_ERROR */,
      message: `failed to encrypt$`,
      metadata: { ...metadata },
      stack
    });
  }
  static DecryptError({ metadata = {}, stack } = {}) {
    return new SparkError({
      name: "DECRYPT_ERROR" /* DECRYPT_ERROR */,
      message: `failed to decrypt$`,
      metadata: { ...metadata },
      stack
    });
  }
}
