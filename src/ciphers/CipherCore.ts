import { CipherErrors } from "../errors/cipher";
import { DecryptedData, EncryptedData, EncryptionKeyPair, EncryptionPublicKey, EncryptionSecret, EncryptionSharedKey } from "./types";

export abstract class CipherCore {
  protected _publicKey: EncryptionPublicKey
  protected _secretKey: EncryptionSecret;

  constructor() {
    this.getPublicKey = this.getPublicKey.bind(this);
    this.getSecretKey = this.getSecretKey.bind(this);
    this.getKeyPair = this.getKeyPair.bind(this);
    this.setKeyPair = this.setKeyPair.bind(this);
    this.generateKeyPair = this.generateKeyPair.bind(this);
    this.generateSharedKey = this.generateSharedKey.bind(this);
    this.encrypt = this.encrypt.bind(this);
    this.decrypt = this.decrypt.bind(this);
  }

  public getPublicKey(): EncryptionPublicKey {
    try {
      if (!this._publicKey) throw new Error('No public key found.')
      return this._publicKey as EncryptionPublicKey;
    } catch (error) {
      throw CipherErrors.GetEncryptionPublicKeyError(error);
    }
  }

  public getSecretKey(): EncryptionSecret {
    try {
      if (!this._secretKey) throw new Error('No secret key found.')
      return this._secretKey as EncryptionSecret;
    } catch (error) {
      throw CipherErrors.GetEncryptionSecretKeyError(error);
    }
  }

  public getKeyPair(): EncryptionKeyPair {
    try {
      const publicKey = this.getPublicKey() as EncryptionPublicKey;
      const secretKey = this.getSecretKey() as EncryptionSecret;
      if (!publicKey || !secretKey) throw new Error('No key pair found.');
      return { publicKey, secretKey } as EncryptionKeyPair;
    } catch (error) {
      throw CipherErrors.GetEncryptionKeypairError(error);
    }
  }

  public setKeyPair({ keyPair }: { keyPair: EncryptionKeyPair }): void {
    try {
      if (!keyPair) throw new Error('No key pair found.')
      if (!keyPair.publicKey) throw new Error('No public key found.')
      if (!keyPair.secretKey) throw new Error('No secret key found.')
      this._publicKey = keyPair.publicKey as EncryptionPublicKey;
      this._secretKey = keyPair.secretKey as EncryptionSecret;
    } catch (error) {
      throw CipherErrors.SetEncryptionKeypairError(error);
    }
  }

  public abstract generateKeyPair(params?: Record<string, any>): Promise<EncryptionKeyPair>;
  public abstract generateSharedKey(params?: Record<string, any>): Promise<EncryptionSharedKey>;
  public abstract encrypt(params?: Record<string, any>): Promise<EncryptedData>;
  public abstract decrypt(params?: Record<string, any>): Promise<DecryptedData>;
}