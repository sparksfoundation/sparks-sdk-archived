export type EncryptionSharedKey = string;
export type CipherPublicKey = string;
export type CipherSecretKey = string;
export type CipherKeyPair = { publicKey: CipherPublicKey, secretKey: CipherSecretKey };
export type DecryptedData = string | Record<string, any>;
export type EncryptedData = string;
export type EncryptionSecret = string;

export enum CipherType {
  SPARK_SIGNER = 'SPARK_SIGNER',
  X25519_SALSA_POLY_CIPHER = 'X25519_SALSA_POLY_CIPHER',
  X25519_SALSA_POLY_CIPHER_PASSWORD = 'X25519_SALSA_POLY_CIPHER_PASSWORD',
}

export interface SparkCipherInterface {
  readonly publicKey: string;
  readonly secretKey: string;
  readonly keyPair: { publicKey: string, secretKey: string };

  generateSharedKey(params?: Record<string, any>): Promise<EncryptionSharedKey>;
  generateKeyPair(params?: Record<string, any>): Promise<CipherKeyPair>;
  setKeyPair(params: CipherKeyPair): void;

  encrypt(params?: Record<string, any>): Promise<EncryptedData>;
  decrypt(params?: Record<string, any>): Promise<DecryptedData>;

  import(data: Record<string, any>): Promise<void>;
  export(): Promise<Record<string, any>>;
}