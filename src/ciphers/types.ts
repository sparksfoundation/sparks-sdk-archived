export type EncryptionSharedKey = string;
export type EncryptionPublicKey = string;
export type EncryptionSecretKey = string;
export type EncryptionKeyPair = { publicKey: EncryptionPublicKey, secretKey: EncryptionSecretKey };
export type DecryptedData = string | Record<string, any>;
export type EncryptedData = string;
export type EncryptionSecret = string;

export enum CipherType {
  CIPHER_CORE = 'CIPHER_CORE',
  X25519_SALSA_POLY_CIPHER = 'X25519_SALSA_POLY_CIPHER',
}

