import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { parseJSON } from "../../common/index.mjs";
import { SignerErrorFactory } from "../../errors/signer.mjs";
import { SignerAbstract } from "../../types/index.mjs";
const errors = new SignerErrorFactory("Ed25519");
export class Ed25519 extends SignerAbstract {
  getPublicKey() {
    if (!this._publicKey)
      return errors.InvalidPublicKey();
    return this._publicKey;
  }
  getSecretKey() {
    if (!this._secretKey)
      return errors.InvalidSecretKey();
    return this._secretKey;
  }
  getKeyPair() {
    if (!this._publicKey || !this._secretKey)
      return errors.InvalidKeyPair();
    return { publicKey: this._publicKey, secretKey: this._secretKey };
  }
  async initKeyPair(seed) {
    try {
      const keyPair = seed ? nacl.sign.keyPair.fromSeed(util.decodeBase64(seed)) : nacl.sign.keyPair();
      const publicKey = util.encodeBase64(keyPair.publicKey);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey)
        throw new Error();
      this._publicKey = publicKey;
      this._secretKey = secretKey;
    } catch (error) {
      return errors.KeyPairFailure(error.message);
    }
  }
  async seal(data) {
    try {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString);
      const uintSecretKey = util.decodeBase64(this._secretKey);
      const signature = util.encodeBase64(nacl.sign(uintData, uintSecretKey));
      if (!signature)
        throw new Error();
      return signature;
    } catch (error) {
      return errors.SigningFailure(error.message);
    }
  }
  async open({ publicKey, signature }) {
    try {
      const uintSignature = util.decodeBase64(signature);
      const uintPublicKey = util.decodeBase64(publicKey);
      const uintResult = nacl.sign.open(uintSignature, uintPublicKey);
      const utf8Result = util.encodeUTF8(uintResult);
      const data = parseJSON(utf8Result) || utf8Result;
      if (!data)
        throw new Error();
      return data;
    } catch (error) {
      return errors.SignatureOpenFailure(error.message);
    }
  }
  async sign(data) {
    try {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString);
      const uintSecretKey = util.decodeBase64(this._secretKey);
      const signature = util.encodeBase64(nacl.sign.detached(uintData, uintSecretKey));
      if (!signature)
        throw new Error();
      return signature;
    } catch (error) {
      return errors.SealDataFailure(error.message);
    }
  }
  async verify({ publicKey, signature, data }) {
    try {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(dataString);
      const uintSignature = util.decodeBase64(signature);
      const uintPublicKey = util.decodeBase64(publicKey);
      const verified = nacl.sign.detached.verify(uintData, uintSignature, uintPublicKey);
      if (typeof verified !== "boolean")
        throw new Error();
      return verified;
    } catch (error) {
      return errors.SignatureVerificationFailure(error.message);
    }
  }
}
