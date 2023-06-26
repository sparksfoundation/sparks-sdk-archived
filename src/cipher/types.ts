import { ErrorInterface } from '../common/errors';

export type EncryptionSharedKey = string;
export type EncryptionPublicKey = string;
export type EncryptionSecretKey = string;
export type EncryptionKeyPair = { publicKey: EncryptionPublicKey, secretKey: EncryptionSecretKey };
export type DecryptedData = string | Record<string, any>;
export type EncryptedData = string;
export type EncryptionSecret = string;

export enum CipherType {
  X25519_SALSA_POLY = 'X25519_SALSA_POLY',
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

export abstract class CipherAbstract {
  public abstract getPublicKey(...args: any): EncryptionPublicKey | ErrorInterface;
  public abstract getSecretKey(...args: any): EncryptionSecretKey | ErrorInterface;
  public abstract getKeyPair(...args: any): EncryptionKeyPair | ErrorInterface;

  public abstract generateKeyPair(...args: any): Promise<EncryptionKeyPair | ErrorInterface>;
  public abstract setKeyPair(...args: any): Promise<void | ErrorInterface>;
  
  public abstract generateSharedKey(...args: any): Promise<EncryptionSharedKey | ErrorInterface>;

  public abstract encrypt(...args: any): Promise<EncryptedData | ErrorInterface>;
  public abstract decrypt(...args: any): Promise<DecryptedData | ErrorInterface>;
}