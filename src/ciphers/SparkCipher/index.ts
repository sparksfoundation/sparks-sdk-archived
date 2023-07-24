import { SparkErrors } from "../../errors";
import { CipherErrors } from "../../errors/ciphers";
import { CipherKeyPair, CipherPublicKey, CipherSecretKey, DecryptedData, EncryptedData, EncryptionSharedKey, SparkCipherInterface } from "./types";

export abstract class SparkCipher implements SparkCipherInterface {
  private _publicKey: string;
  private _secretKey: string;

  constructor() {
    this.setKeyPair = this.setKeyPair.bind(this);
    this.generateKeyPair = this.generateKeyPair.bind(this);
    this.generateSharedKey = this.generateSharedKey.bind(this);
    this.encrypt = this.encrypt.bind(this);
    this.decrypt = this.decrypt.bind(this);
  }

  public get publicKey(): CipherPublicKey {
    return this._publicKey;
  }

  public get secretKey(): CipherSecretKey {
    return this._secretKey;
  }

  public get keyPair(): CipherKeyPair {
    const publicKey = this.publicKey;
    const secretKey = this.secretKey;
    return { publicKey, secretKey };
  }

  public async import(data: Record<string, any>): Promise<void> {
    if (!data) throw SparkErrors.SPARK_IMPORT_ERROR();
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({});
  }

  public setKeyPair({ publicKey, secretKey }: CipherKeyPair): void {
    if (!publicKey) throw CipherErrors.CIPHER_PUBLICKEY_ERROR();
    if (!secretKey) throw CipherErrors.CIPHER_SECRETKEY_ERROR();
    this._publicKey = publicKey;
    this._secretKey = secretKey;
  }

  public abstract generateKeyPair(params?: Record<string, any>): Promise<CipherKeyPair>;
  public abstract generateSharedKey(params?: Record<string, any>): Promise<EncryptionSharedKey>;
  public abstract encrypt(params?: Record<string, any>): Promise<EncryptedData>;
  public abstract decrypt(params?: Record<string, any>): Promise<DecryptedData>;
}
