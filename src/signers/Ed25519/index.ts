import { SparkSigner } from "../SparkSigner";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { SigatureDetached, Signature, SignatureData, SignatureVerified, SignerKeyPair, SignerPublicKey, SignerSecretKey } from "../SparkSigner/types";
import { parseJSON } from "../../utilities";
import { SignerErrors } from "../../errors/signers";
import { SparkEvent } from "../../events/SparkEvent";

export class Ed25519 extends SparkSigner {
  public async import(data: Record<string, any>): Promise<void> {
    await super.import(data);
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    return Promise.resolve(data);
  }

  public async generateKeyPair(params?: { secretKey?: SignerSecretKey }): Promise<SignerKeyPair> {
    try {
      const keyPair = params?.secretKey ? nacl.sign.keyPair.fromSecretKey(util.decodeBase64(params?.secretKey)) : nacl.sign.keyPair();
      const publicKey = util.encodeBase64(keyPair.publicKey);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey) throw SignerErrors.SIGNER_KEYPAIR_ERROR();
      return { publicKey, secretKey };
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to generate key pair. ${error?.message || ''}`,
      }));
    }
  }

  public async seal({ data }: { data: SignatureData }): Promise<Signature> {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString as string);
      const uintSecretKey = util.decodeBase64(this._secretKey);
      const signature = util.encodeBase64(nacl.sign(uintData, uintSecretKey));
      if (!signature) throw SignerErrors.SIGNER_SEAL_ERROR();
      return signature;
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to seal data. ${error?.message || ''}`,
      }));
    }
  }

  public async open({ publicKey, signature }: { publicKey: SignerPublicKey, signature: Signature }): Promise<SignatureData> {
    try {
      const uintSignature = util.decodeBase64(signature);
      const uintPublicKey = util.decodeBase64(publicKey);
      const uintResult = nacl.sign.open(uintSignature, uintPublicKey);
      if (!uintResult) throw SignerErrors.SIGNER_OPEN_SEAL_ERROR();
      const utf8Result = util.encodeUTF8(uintResult);
      const data = parseJSON(utf8Result) || utf8Result;
      if (!data) throw SignerErrors.SIGNER_OPEN_SEAL_ERROR();
      return data;
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to open data. ${error?.message || ''}`,
      }));
    }
  }

  public async sign({ data }: { data: SignatureData }): Promise<SigatureDetached> {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString as string);
      const uintSecretKey = util.decodeBase64(this._secretKey);
      const signature = util.encodeBase64(nacl.sign.detached(uintData, uintSecretKey));
      if (!signature) throw SignerErrors.SIGNER_SIGNING_ERROR();
      return signature;
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to sign data. ${error?.message || ''}`,
      }));
    }
  }

  public async verify({ publicKey, signature, data }: { publicKey: SignerPublicKey, signature: Signature, data: SignatureData }): Promise<SignatureVerified> {
    try {
      if (!data) throw new Error('Missing data to verify signature.');
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString as string);
      const uintSignature = util.decodeBase64(signature);
      const uintPublicKey = util.decodeBase64(publicKey);
      const verified = nacl.sign.detached.verify(uintData, uintSignature, uintPublicKey);
      return verified;
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to verify signature. ${error?.message || ''}`,
      }));
    }
  }
}
