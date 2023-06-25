import { ErrorInterface } from "./Error";

export type EncryptionSharedKey = string;
export type EncryptionPublicKey = string;
export type EncryptionSecretKey = string;
export type EncryptionKeyPair = { publicKey: EncryptionPublicKey, secretKey: EncryptionSecretKey };
export type DecryptedData = string | Record<string, any>;
export type EncryptedData = string;
export type EncryptionSecret = string;

export abstract class CipherAbstract {
  public abstract getPublicKey(): EncryptionPublicKey | ErrorInterface;
  public abstract getSecretKey(): EncryptionSecretKey | ErrorInterface;
  public abstract getKeyPair(): EncryptionKeyPair | ErrorInterface;

  public abstract initKeyPair(...args: any): Promise<EncryptionKeyPair | ErrorInterface>;
  public abstract computeSharedKey(...args: any): Promise<EncryptionSharedKey | ErrorInterface>;

  public abstract encrypt(...args: any): Promise<EncryptedData | ErrorInterface>;
  public abstract decrypt(...args: any): Promise<DecryptedData | ErrorInterface>;
}