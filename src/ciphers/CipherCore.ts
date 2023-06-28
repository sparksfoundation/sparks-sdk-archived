import { CipherErrors } from "../errors/cipher";
import { DecryptedData, EncryptedData, CipherKeyPair, CipherPublicKey, EncryptionSecret, EncryptionSharedKey } from "./types";

export abstract class CipherCore {
  protected _publicKey: CipherPublicKey
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

  public async import(data: Record<string, any>): Promise<void> {
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({});
  }

  public getPublicKey(): CipherPublicKey {
    try {
      if (!this._publicKey) throw new Error('No public key found.')
      return this._publicKey as CipherPublicKey;
    } catch (error) {
      throw CipherErrors.GetCipherPublicKeyError(error);
    }
  }

  public getSecretKey(): EncryptionSecret {
    try {
      if (!this._secretKey) throw new Error('No secret key found.')
      return this._secretKey as EncryptionSecret;
    } catch (error) {
      throw CipherErrors.GetCipherSecretKeyError(error);
    }
  }

  public getKeyPair(): CipherKeyPair {
    try {
      const publicKey = this.getPublicKey() as CipherPublicKey;
      const secretKey = this.getSecretKey() as EncryptionSecret;
      if (!publicKey || !secretKey) throw new Error('No key pair found.');
      return { publicKey, secretKey } as CipherKeyPair;
    } catch (error) {
      throw CipherErrors.GetEncryptionKeypairError(error);
    }
  }

  public setKeyPair({ publicKey, secretKey }: CipherKeyPair): void {
    try {
      if (!publicKey) throw new Error('No public key found.')
      if (!secretKey) throw new Error('No secret key found.')
      this._publicKey = publicKey as CipherPublicKey;
      this._secretKey = secretKey as EncryptionSecret;
    } catch (error) {
      throw CipherErrors.SetEncryptionKeypairError(error);
    }
  }

  public abstract generateKeyPair(params?: Record<string, any>): Promise<CipherKeyPair>;
  public abstract generateSharedKey(params?: Record<string, any>): Promise<EncryptionSharedKey>;
  public abstract encrypt(params?: Record<string, any>): Promise<EncryptedData>;
  public abstract decrypt(params?: Record<string, any>): Promise<DecryptedData>;
}