import { CipherType, DecryptedData, EncryptedData, EncryptionKeyPair, EncryptionPublicKey, EncryptionSecret, EncryptionSharedKey } from "./types";
import { CipherErrorFactory } from "./errorFactory";
import { ErrorInterface, SparkError } from "../common/errors";
const errors = new CipherErrorFactory(CipherType.CORE_CIPHER);

export abstract class CipherAbstract {
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

  public getPublicKey(): EncryptionPublicKey | ErrorInterface {
    if (!this._publicKey) return errors.InvalidPublicKey() as ErrorInterface;
    return this._publicKey as EncryptionPublicKey;
  }

  public getSecretKey(): EncryptionSecret | ErrorInterface {
    if (!this._secretKey) return errors.InvalidSecretKey() as ErrorInterface;
    return this._secretKey as EncryptionSecret;
  }

  public getKeyPair(): EncryptionKeyPair | ErrorInterface {
    const publicKey = this.getPublicKey() as EncryptionPublicKey;
    const secretKey = this.getSecretKey() as EncryptionSecret;
    const errors = SparkError.get(publicKey, secretKey);
    if (errors) return errors as ErrorInterface;
    return { publicKey, secretKey } as EncryptionKeyPair;
  }

  public setKeyPair(keyPair: EncryptionKeyPair): void | ErrorInterface {
    if (!keyPair) return errors.InvalidKeyPair() as ErrorInterface;
    if (!keyPair.publicKey) return errors.InvalidPublicKey() as ErrorInterface;
    if (!keyPair.secretKey) return errors.InvalidSecretKey() as ErrorInterface;
    this._publicKey = keyPair.publicKey as EncryptionPublicKey;
    this._secretKey = keyPair.secretKey as EncryptionSecret;
  }

  public abstract generateKeyPair(args: any): Promise<EncryptionKeyPair | ErrorInterface>;
  public abstract generateSharedKey(args: any): Promise<EncryptionSharedKey | ErrorInterface>;
  public abstract encrypt(args: any): Promise<EncryptedData | ErrorInterface>;
  public abstract decrypt(args: any): Promise<DecryptedData | ErrorInterface>;
}