import { SparkError, SparkErrorParams } from "./SparkError";

export enum CipherErrorName {
  GET_ENCRYPTION_PUBLIC_KEY_ERROR = 'GET_ENCRYPTION_PUBLIC_KEY_ERROR',
  GET_ENCRYPTION_SECRET_KEY_ERROR = 'GET_ENCRYPTION_SECRET_KEY_ERROR',
  GET_ENCRYPTION_KEYPAIR_ERROR = 'GET_ENCRYPTION_KEYPAIR_ERROR',
  SET_ENCRYPTION_KEYPAIR_ERROR = 'SET_ENCRYPTION_KEYPAIR_ERROR',
  GENERATE_ENCRYPTION_KEY_PAIR_ERROR = 'GENERATE_ENCRYPTION_KEY_PAIR_ERROR',
  GENERATE_ENCRYPTION_SHARED_KEY_ERROR = 'GENERATE_ENCRYPTION_SHARED_KEY_ERROR',
  ENCRYPT_ERROR = 'ENCRYPT_ERROR',
  DECRYPT_ERROR = 'DECRYPT_ERROR',
}

export class CipherErrors {
  public static GetCipherPublicKeyError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.GET_ENCRYPTION_PUBLIC_KEY_ERROR,
      message: `failed to get cipher public key$`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GetCipherSecretKeyError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.GET_ENCRYPTION_SECRET_KEY_ERROR,
      message: `failed to get cipher secret key$`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GetEncryptionKeypairError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.GET_ENCRYPTION_KEYPAIR_ERROR,
      message: `failed to get cipher keypair$`,
      metadata: { ...metadata },
      stack
    });
  }

  public static SetEncryptionKeypairError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.SET_ENCRYPTION_KEYPAIR_ERROR,
      message: `failed to set cipher keypair$`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GenerateCipherKeyPairError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.GENERATE_ENCRYPTION_KEY_PAIR_ERROR,
      message: `failed to generate cipher keypair$`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GenerateEncryptionSharedKeyError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.GENERATE_ENCRYPTION_SHARED_KEY_ERROR,
      message: `failed to generate cipher shared key$`,
      metadata: { ...metadata },
      stack
    });
  }

  public static EncryptError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.ENCRYPT_ERROR,
      message: `failed to encrypt$`,
      metadata: { ...metadata },
      stack
    });
  }

  public static DecryptError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.DECRYPT_ERROR,
      message: `failed to decrypt$`,
      metadata: { ...metadata },
      stack
    });
  }
}