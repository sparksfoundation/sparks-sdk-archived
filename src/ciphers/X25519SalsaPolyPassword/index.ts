import util from "tweetnacl-util";
import { DecryptedData, EncryptedData, CipherKeyPair, CipherPublicKey, CipherSecretKey } from '../SparkCipher/types';
import { X25519SalsaPoly } from "../X25519SalsaPoly";
import nacl from "tweetnacl";
import * as scrypt from "scrypt-pbkdf";
import { SparkCipher } from "../SparkCipher";
import { SparkErrors } from "../../errors";
import { CipherErrors } from "../../errors/ciphers";
import { SparkEvent } from "../../events/SparkEvent";

export type CipherKeyPairWithSalt = CipherKeyPair & { salt: string };

export class X25519SalsaPolyPassword extends SparkCipher {
  private _X25519SalsaPoly: X25519SalsaPoly;
  private _salt: string;
  
  constructor() {
    super({
      algorithm: 'x25519-salsa20-poly1305',
    });
    this._X25519SalsaPoly = new X25519SalsaPoly();
  }

  public get salt(): string {
    return this._salt;
  }

  public get publicKey(): CipherPublicKey {
    return this._X25519SalsaPoly.publicKey;
  }

  public get secretKey(): CipherSecretKey {
    return this._X25519SalsaPoly.secretKey;
  }

  public get keyPair(): CipherKeyPairWithSalt {
    const keyPair = this._X25519SalsaPoly.keyPair;
    return { ...keyPair, salt: this._salt };
  }

  public async import(data: Record<string, any>): Promise<void> {
    if (data?.salt) this._salt = data.salt;
    await super.import(data);
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    data.salt = this._salt;
    return Promise.resolve(data);
  }

  public async generateSharedKey(params: Parameters<X25519SalsaPoly['generateSharedKey']>[0]): Promise<string> {
    const sharedKey = await this._X25519SalsaPoly.generateSharedKey(params);
    if (!sharedKey) throw CipherErrors.CIPHER_SHARED_KEY_ERROR();
    return sharedKey;
  }

  public async generateKeyPair({ password, salt: nonce }: { password: string, salt?: string }): Promise<CipherKeyPairWithSalt> {
    try {
      const options = { N: 16384, r: 8, p: 1 };
      const salt = nonce || util.encodeBase64(nacl.randomBytes(16));
      const len = nacl.box.secretKeyLength / 2;
      const buffer = await scrypt.scrypt(password, salt, len, options);

      const seed = [...new Uint8Array(buffer)]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('');

      const uint8Seed = util.decodeUTF8(seed);
      const keyPair = nacl.box.keyPair.fromSecretKey(uint8Seed);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      const publicKey = util.encodeBase64(keyPair.publicKey);

      if (!secretKey || !publicKey || !salt) {
        throw CipherErrors.CIPHER_KEYPAIR_ERROR();
      }

      return { publicKey, secretKey, salt } as CipherKeyPairWithSalt;
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(CipherErrors.CIPHER_UNEXPECTED_ERROR({
        message: `Failed to generate key pair. ${error?.message || ''}`,
      }));
    }
  }

  public setKeyPair({ publicKey, secretKey, salt }: CipherKeyPairWithSalt): void {
    this._salt = salt;
    if (!salt) throw CipherErrors.CIPHER_KEYPAIR_ERROR();
    this._X25519SalsaPoly.setKeyPair({ publicKey, secretKey });
  }

  public async decrypt(params: Parameters<X25519SalsaPoly['decrypt']>[0]): Promise<DecryptedData> {
    return this._X25519SalsaPoly.decrypt(params);
  }

  public async encrypt(params: Parameters<X25519SalsaPoly['encrypt']>[0]): Promise<EncryptedData> {
    return this._X25519SalsaPoly.encrypt(params);
  }
}
