import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { parseJSON } from "../../common";
import { SigatureDetached, Signature, SignatureData, SignatureVerified, SigningKeyPair, SigningPublicKey, SigningSecretKey } from "../types";
import { SignerCore } from "../SignerCore";
import { SignerErrors } from "../../error/signer";

export class Ed25519 extends SignerCore {
  public async generateKeyPair(params?: { secretKey: SigningSecretKey }): Promise<SigningKeyPair> {
    try {
      const keyPair = params?.secretKey ? nacl.sign.keyPair.fromSecretKey(util.decodeBase64(params?.secretKey)) : nacl.sign.keyPair();
      const publicKey = util.encodeBase64(keyPair.publicKey);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey) throw new Error('Failed to generate key pair.');
      return { publicKey, secretKey } as SigningKeyPair;
    } catch (error) {
      return Promise.reject(SignerErrors.GenerateSigningKeyPairError(error));
    }
  }

  public async seal({ data }: { data: SignatureData }): Promise<Signature> {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString as string);
      const uintSecretKey = util.decodeBase64(this._secretKey);
      const signature = util.encodeBase64(nacl.sign(uintData, uintSecretKey));
      if (!signature) throw new Error('Failed to seal signature.');
      return signature as Signature;
    } catch (error) {
      return Promise.reject(SignerErrors.MessageSealingError(error));
    }
  }

  public async open({ publicKey, signature }: { publicKey: SigningPublicKey, signature: Signature }): Promise<SignatureData> {
    try {
      const uintSignature = util.decodeBase64(signature);
      const uintPublicKey = util.decodeBase64(publicKey);
      const uintResult = nacl.sign.open(uintSignature, uintPublicKey);
      if (!uintResult) throw new Error('invalid signature')
      const utf8Result = util.encodeUTF8(uintResult);
      const data = parseJSON(utf8Result) || utf8Result;
      if (!data) throw new Error('invalid utf8 encoding')
      return data as SignatureData;
    } catch (error) {
      return Promise.reject(SignerErrors.SignatureOpeningError(error));
    }
  }

  public async sign({ data }: { data: SignatureData }): Promise<SigatureDetached> {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString as string);
      const uintSecretKey = util.decodeBase64(this._secretKey);
      const signature = util.encodeBase64(nacl.sign.detached(uintData, uintSecretKey));
      if (!signature) throw new Error('Failed to sign data.');
      return signature as Signature;
    } catch (error) {
      return Promise.reject(SignerErrors.MessageSigningError(error));
    }
  }

  public async verify({ publicKey, signature, data }: { publicKey: SigningPublicKey, signature: Signature, data: SignatureData }): Promise<SignatureVerified> {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString as string);
      const uintSignature = util.decodeBase64(signature);
      const uintPublicKey = util.decodeBase64(publicKey);
      const verified = nacl.sign.detached.verify(uintData, uintSignature, uintPublicKey);
      if (typeof verified !== 'boolean') throw new Error('Failed to check signature verification validity.');
      return verified as SignatureVerified;
    } catch (error) {
      return Promise.reject(SignerErrors.SignatureVerificationError(error));
    }
  }
}