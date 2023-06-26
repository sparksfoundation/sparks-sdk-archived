import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { parseJSON } from "../../common";
import { SignerErrorFactory } from "../errorFactory";
import { Signature, SignatureData, SignatureVerified, SignerAbstract, SignerType, SigningKeyPair, SigningPublicKey, SigningSecretKey, SingingSeed } from "../types";
import { ErrorInterface } from "../../common/errors";

const errors = new SignerErrorFactory(SignerType.Ed25519);

export class Ed25519 extends SignerAbstract {
  private _publicKey: SigningPublicKey;
  private _secretKey: SigningSecretKey;

  constructor() {
    super();
    this.getPublicKey = this.getPublicKey.bind(this);
    this.getSecretKey = this.getSecretKey.bind(this);
    this.getKeyPair = this.getKeyPair.bind(this);
    this.setKeyPair = this.setKeyPair.bind(this);
    this.generateKeyPair = this.generateKeyPair.bind(this);
    this.sign = this.sign.bind(this);
    this.verify = this.verify.bind(this);
    this.seal = this.seal.bind(this);
    this.open = this.open.bind(this);
  }

  public getPublicKey(): ReturnType<SignerAbstract['getPublicKey']> {
    if (!this._publicKey) return errors.InvalidPublicKey() as ErrorInterface;
    return this._publicKey as SigningPublicKey;
  }

  public getSecretKey(): ReturnType<SignerAbstract['getSecretKey']> {
    if (!this._secretKey) return errors.InvalidSecretKey() as ErrorInterface;
    return this._secretKey as SigningSecretKey;
  }

  public getKeyPair(): ReturnType<SignerAbstract['getKeyPair']> {
    if (!this._publicKey || !this._secretKey) return errors.InvalidKeyPair() as ErrorInterface;
    return { publicKey: this._publicKey, secretKey: this._secretKey } as SigningKeyPair;
  }

  public async generateKeyPair(secret?: SingingSeed): ReturnType<SignerAbstract['generateKeyPair']> {
    try {
      const keyPair = secret ? nacl.sign.keyPair.fromSecretKey(util.decodeBase64(secret)) : nacl.sign.keyPair();
      const publicKey = util.encodeBase64(keyPair.publicKey);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey) throw new Error('keyPair');
      return { publicKey, secretKey } as SigningKeyPair;
    } catch (error) {
      return errors.KeyPairFailure(error.message) as ErrorInterface;
    }
  }

  public async setKeyPair(keyPair: SigningKeyPair): ReturnType<SignerAbstract['setKeyPair']> {
    if (!keyPair?.publicKey || !keyPair?.secretKey) return errors.InvalidKeyPair() as ErrorInterface;
    this._publicKey = keyPair.publicKey;
    this._secretKey = keyPair.secretKey;
  }

  public async seal(data: SignatureData): ReturnType<SignerAbstract['seal']> {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString as string);
      const uintSecretKey = util.decodeBase64(this._secretKey);
      const signature = util.encodeBase64(nacl.sign(uintData, uintSecretKey));
      if (!signature) throw new Error();
      return signature as Signature;
    } catch (error) {
      return errors.SigningFailure(error.message) as ErrorInterface;
    }
  }

  public async open({ publicKey, signature }: { publicKey: SigningPublicKey, signature: Signature }): ReturnType<SignerAbstract['open']> {
    try {
      const uintSignature = util.decodeBase64(signature);
      const uintPublicKey = util.decodeBase64(publicKey);
      const uintResult = nacl.sign.open(uintSignature, uintPublicKey);
      const utf8Result = util.encodeUTF8(uintResult);
      const data = parseJSON(utf8Result) || utf8Result;
      if (!data) throw new Error();
      return data as SignatureData;
    } catch (error) {
      return errors.SignatureOpenFailure(error.message) as ErrorInterface;
    }
  }

  public async sign(data: SignatureData): ReturnType<SignerAbstract['sign']> {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString as string);
      const uintSecretKey = util.decodeBase64(this._secretKey);
      const signature = util.encodeBase64(nacl.sign.detached(uintData, uintSecretKey));
      if (!signature) throw new Error();
      return signature as Signature;
    } catch (error) {
      return errors.SealDataFailure(error.message) as ErrorInterface;
    }
  }

  public async verify({ publicKey, signature, data }: { publicKey: SigningPublicKey, signature: Signature, data: SignatureData }): ReturnType<SignerAbstract['verify']> {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString as string);
      const uintSignature = util.decodeBase64(signature);
      const uintPublicKey = util.decodeBase64(publicKey);
      const verified = nacl.sign.detached.verify(uintData, uintSignature, uintPublicKey);
      if (typeof verified !== 'boolean') throw new Error();
      return verified as SignatureVerified;
    } catch (error) {
      return errors.SignatureVerificationFailure(error.message) as ErrorInterface;
    }
  }
}