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
  public static GetEncryptionPublicKeyError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.GET_ENCRYPTION_PUBLIC_KEY_ERROR,
      message: `failed to get encryption public key${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GetEncryptionSecretKeyError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.GET_ENCRYPTION_SECRET_KEY_ERROR,
      message: `failed to get encryption secret key${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GetEncryptionKeypairError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.GET_ENCRYPTION_KEYPAIR_ERROR,
      message: `failed to get encryption keypair${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static SetEncryptionKeypairError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.SET_ENCRYPTION_KEYPAIR_ERROR,
      message: `failed to set encryption keypair${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GenerateEncryptionKeyPairError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.GENERATE_ENCRYPTION_KEY_PAIR_ERROR,
      message: `failed to generate encryption keypair${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GenerateEncryptionSharedKeyError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.GENERATE_ENCRYPTION_SHARED_KEY_ERROR,
      message: `failed to generate encryption shared key${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static EncryptError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.ENCRYPT_ERROR,
      message: `failed to encrypt${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static DecryptError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: CipherErrorName.DECRYPT_ERROR,
      message: `failed to decrypt${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }
}