export type EncryptionSharedKey = string;
export type CipherPublicKey = string;
export type CipherSecretKey = string;
export type CipherKeyPair = { publicKey: CipherPublicKey, secretKey: CipherSecretKey };
export type DecryptedData = string | Record<string, any>;
export type EncryptedData = string;
export type EncryptionSecret = string;

export enum CipherType {
  CORE_CIPHER = 'CORE_CIPHER',
  X25519_SALSA_POLY_CIPHER = 'X25519_SALSA_POLY_CIPHER',
  X25519_SALSA_POLY_CIPHER_PASSWORD = 'X25519_SALSA_POLY_CIPHER_PASSWORD',
}