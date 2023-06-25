import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { parseJSON } from "../../common";
import { SignerErrorFactory } from "../../errors/signer";
import { ErrorInterface, Signature, SignatureData, SignatureVerified, SignerAbstract, SigningKeyPair, SigningPublicKey, SigningSecretKey, SingingSeed } from "../../types";
const errors = new SignerErrorFactory('Ed25519');

export class Ed25519 extends SignerAbstract {
  private _publicKey: SigningPublicKey;
  private _secretKey: SigningSecretKey;

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

  public async initKeyPair(seed?: SingingSeed): ReturnType<SignerAbstract['initKeyPair']> {
    try {
      const keyPair = seed ? nacl.sign.keyPair.fromSeed(util.decodeBase64(seed)) : nacl.sign.keyPair();
      const publicKey = util.encodeBase64(keyPair.publicKey);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey) throw new Error();
      this._publicKey = publicKey as SigningPublicKey;
      this._secretKey = secretKey as SigningSecretKey;
    } catch (error) {
      return errors.KeyPairFailure(error.message) as ErrorInterface;
    }
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