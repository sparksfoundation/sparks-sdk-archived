import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { parseJSON } from "../../utilities/index.mjs";
import { CoreSigner } from "../CoreSigner.mjs";
import { SignerErrors } from "../../errors/signer.mjs";
export class Ed25519 extends CoreSigner {
  async import(data) {
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    return Promise.resolve(data);
  }
  async generateKeyPair(params) {
    try {
      const keyPair = params?.secretKey ? nacl.sign.keyPair.fromSecretKey(util.decodeBase64(params?.secretKey)) : nacl.sign.keyPair();
      const publicKey = util.encodeBase64(keyPair.publicKey);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey)
        throw new Error("Failed to generate key pair.");
      return { publicKey, secretKey };
    } catch (error) {
      return Promise.reject(SignerErrors.GenerateSignerKeyPairError(error));
    }
  }
  async seal({ data }) {
    try {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString);
      const uintSecretKey = util.decodeBase64(this._secretKey);
      const signature = util.encodeBase64(nacl.sign(uintData, uintSecretKey));
      if (!signature)
        throw new Error("Failed to seal signature.");
      return signature;
    } catch (error) {
      return Promise.reject(SignerErrors.MessageSealingError(error));
    }
  }
  async open({ publicKey, signature }) {
    try {
      const uintSignature = util.decodeBase64(signature);
      const uintPublicKey = util.decodeBase64(publicKey);
      const uintResult = nacl.sign.open(uintSignature, uintPublicKey);
      if (!uintResult)
        throw new Error("invalid signature");
      const utf8Result = util.encodeUTF8(uintResult);
      const data = parseJSON(utf8Result) || utf8Result;
      if (!data)
        throw new Error("invalid utf8 encoding");
      return data;
    } catch (error) {
      console.log(error, "reason");
      return Promise.reject(SignerErrors.SignatureOpeningError(error));
    }
  }
  async sign({ data }) {
    try {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString);
      const uintSecretKey = util.decodeBase64(this._secretKey);
      const signature = util.encodeBase64(nacl.sign.detached(uintData, uintSecretKey));
      if (!signature)
        throw new Error("Failed to sign data.");
      return signature;
    } catch (error) {
      return Promise.reject(SignerErrors.MessageSigningError(error));
    }
  }
  async verify({ publicKey, signature, data }) {
    try {
      if (!data)
        throw new Error("Missing data to verify signature.");
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString);
      const uintSignature = util.decodeBase64(signature);
      const uintPublicKey = util.decodeBase64(publicKey);
      const verified = nacl.sign.detached.verify(uintData, uintSignature, uintPublicKey);
      if (typeof verified !== "boolean")
        throw new Error("Failed to check signature verification validity.");
      return verified;
    } catch (error) {
      return Promise.reject(SignerErrors.SignatureVerificationError(error));
    }
  }
}
