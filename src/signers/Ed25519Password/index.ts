import * as scrypt from 'scrypt-pbkdf';
import { SigatureDetached, Signature, SignatureData, SignatureVerified, SignerKeyPair } from "../SparkSigner/types";
import { Ed25519 } from "../Ed25519";
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { SparkSigner } from '../SparkSigner';
import { SignerErrors } from '../../errors/signers';

export type SignerKeyPairWithSalt = SignerKeyPair & { salt: string };

export class Ed25519Password extends SparkSigner {
  private Ed25519: Ed25519;
  private _salt: string;

  constructor() {
    super({
      algorithm: 'ed25519'
    });
    this.Ed25519 = new Ed25519();
  }

  public get salt(): string {
    return this._salt;
  }

  public async import(data: Record<string, any>): Promise<void> {
    this._salt = data.salt;
    if (!data.salt) throw SignerErrors.SIGNER_INVALID_SALT_ERROR();
    await super.import(data);
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    data.salt = this._salt;
    if (!data.salt) throw SignerErrors.SIGNER_INVALID_SALT_ERROR();
    return Promise.resolve(data);
  }

  public async generateKeyPair({ password, salt: nonce }: { password: string, salt?: string }): Promise<SignerKeyPairWithSalt> {
    try {
      const options = { N: 16384, r: 8, p: 1 };
      const salt = nonce || util.encodeBase64(nacl.randomBytes(16));
      const len = nacl.box.secretKeyLength / 2;
      const buffer = await scrypt.scrypt(password, salt, len, options);

      const seed = [...new Uint8Array(buffer)]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('');

      const uint8Seed = util.decodeUTF8(seed);
      const keyPair = nacl.sign.keyPair.fromSeed(uint8Seed);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      const publicKey = util.encodeBase64(keyPair.publicKey);

      if (!publicKey || !secretKey) throw SignerErrors.SIGNER_KEYPAIR_ERROR();

      return { publicKey, secretKey, salt };
    } catch (error: any) {
      if (error instanceof SparkSigner) return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to generate key pair. ${error?.message || ''}`,
      }));
    }
  }

  public get publicKey(): SignerKeyPair['publicKey'] {
    return this.Ed25519.publicKey;
  }

  public get secretKey(): SignerKeyPair['secretKey'] {
    return this.Ed25519.secretKey;
  }

  public get keyPair(): SignerKeyPairWithSalt {
    const keyPair = this.Ed25519.keyPair;
    return { ...keyPair, salt: this._salt }
  }

  public setKeyPair({ publicKey, secretKey, salt }: SignerKeyPairWithSalt): void {
    if (!salt) throw SignerErrors.SIGNER_INVALID_SALT_ERROR();
    this._salt = salt;
    this.Ed25519.setKeyPair({ publicKey, secretKey });
  }

  public async sign(args: Parameters<Ed25519['sign']>[0]): Promise<SigatureDetached> {
    return this.Ed25519.sign(args);
  }

  public async verify(args: Parameters<Ed25519['verify']>[0]): Promise<SignatureVerified> {
    return this.Ed25519.verify(args);
  }

  public async seal(args: Parameters<Ed25519['seal']>[0]): Promise<Signature> {
    return this.Ed25519.seal(args);
  }

  public async open(args: Parameters<Ed25519['open']>[0]): Promise<SignatureData> {
    return this.Ed25519.open(args);
  }
}