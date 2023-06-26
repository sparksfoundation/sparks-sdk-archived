export type EncryptionSharedKey = string;
export type EncryptionPublicKey = string;
export type EncryptionSecretKey = string;
export type EncryptionKeyPair = { publicKey: EncryptionPublicKey, secretKey: EncryptionSecretKey };
export type DecryptedData = string | Record<string, any>;
export type EncryptedData = string;
export type EncryptionSecret = string;

export enum CipherType {
  CORE_CIPHER = 'CORE_CIPHER',
  X25519_SALSA_POLY_CIPHER = 'X25519_SALSA_POLY_CIPHER',
}

export enum CipherErrorType {
  // cipher errors
  INVALID_PUBLIC_ENCRYPTION_KEY = 'INVALID_PUBLIC_ENCRYPTION_KEY',
  INVALID_SECRET_ENCRYPTION_KEY = 'INVALID_SECRET_ENCRYPTION_KEY',
  INVALID_ENCRYPTION_KEYPAIR = 'INVALID_ENCRYPTION_KEYPAIR',
  GENERATE_ENCRYPTION_KEYPAIR_ERROR = 'GENERATE_ENCRYPTION_KEYPAIR_ERROR',
  GENERATE_SHARED_ENCRYPTION_KEY_ERROR = 'GENERATE_SHARED_ENCRYPTION_KEY_ERROR',
  ENCRYPTION_FAILURE = 'ENCRYPTION_FAILURE',
  DECRYPTION_FAILURE = 'DECRYPTION_FAILURE',
}
