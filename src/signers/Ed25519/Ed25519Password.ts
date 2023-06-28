import * as scrypt from 'scrypt-pbkdf';
import { SigatureDetached, Signature, SignatureData, SignatureVerified, SignerKeyPair } from "../types";
import { Ed25519 } from "./Ed25519";
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { SignerCore } from '../SignerCore';
import { SignerErrors } from '../../errors/signer';

export type SignerKeyPairWithSalt = SignerKeyPair & { salt: string };

export class Ed25519Password extends SignerCore {
  private Ed25519: Ed25519;
  private _salt: string;

  constructor() {
    super();
    this.Ed25519 = new Ed25519();
  }

  public get salt(): string {
    return this._salt;
  }

  public async import(data: Record<string, any>): Promise<void> {
    this._salt = data.salt;
    await super.import(data);
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    data.salt = this._salt;
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

      return { publicKey: util.encodeBase64(keyPair.publicKey), secretKey, salt } as SignerKeyPairWithSalt;
    } catch (error) {
      return Promise.reject(SignerErrors.GenerateSignerKeyPairError(error));
    }
  }

  public getPublicKey(): SignerKeyPair['publicKey'] {
    return this.Ed25519.getPublicKey();
  }

  public getSecretKey(): SignerKeyPair['secretKey'] {
    return this.Ed25519.getSecretKey();
  }

  public getKeyPair(): SignerKeyPairWithSalt {
    const keyPair = this.Ed25519.getKeyPair();
    return { ...keyPair, salt: this._salt }
  }

  public setKeyPair({ publicKey, secretKey, salt }: SignerKeyPairWithSalt): void {
    this._salt = salt;
    this.Ed25519.setKeyPair({ publicKey, secretKey });
  }

  public async sign(args: Parameters<Ed25519['verify']>[0]): Promise<SigatureDetached> {
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