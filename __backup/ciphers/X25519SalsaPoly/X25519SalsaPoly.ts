import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { ACipher } from "../Cipher/types";
import { parseJSON } from "../../utilities/index";
import { IX25519SalsaPoly } from "./types";

export class X25519SalsaPoly extends ACipher implements IX25519SalsaPoly {
  async computeSharedKey({ publicKey }) {
    if (!this.spark.encryptionKeys) {
      throw new Error('No key pairs found, please import or incept identity')
    }
    const baseEncryptionPublicKey = util.decodeBase64(publicKey)
    const baseEncryptionSecretKey = util.decodeBase64(this.spark.encryptionKeys.secretKey)
    const uintSharedKey = nacl.box.before(baseEncryptionPublicKey, baseEncryptionSecretKey)
    const baseSharedKey = util.encodeBase64(uintSharedKey)
    return baseSharedKey
  }

  async encrypt({ data, publicKey, sharedKey }) {
    if (!this.spark.encryptionKeys) {
      throw new Error('No key pairs found, please import or incept identity')
    }

    const utfData = typeof data === 'string' ? data : JSON.stringify(data);
    const uintData = util.decodeUTF8(utfData);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    let box;
    if (publicKey) {
      const publicKeyUint = util.decodeBase64(publicKey);
      box = nacl.box(uintData, nonce, publicKeyUint, util.decodeBase64(this.spark.encryptionKeys.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = util.decodeBase64(sharedKey);
      box = nacl.box.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = util.decodeBase64(this.spark.encryptionKeys.secretKey);
      box = nacl.secretbox(uintData, nonce, secreKeyUint);
    }

    const encrypted = new Uint8Array(nonce.length + box.length);
    encrypted.set(nonce);
    encrypted.set(box, nonce.length);
    return util.encodeBase64(encrypted);
  }

  async decrypt({ data, publicKey, sharedKey }) {
    if (!this.spark.keyPairs) {
      throw new Error('No key pairs found, please import or incept identity')
    }

    const uintDataAndNonce = util.decodeBase64(data);
    const nonce = uintDataAndNonce.slice(0, nacl.secretbox.nonceLength);
    const uintData = uintDataAndNonce.slice(nacl.secretbox.nonceLength, uintDataAndNonce.length);

    let decrypted;
    if (publicKey) {
      const publicKeyUint = util.decodeBase64(publicKey);
      decrypted = nacl.box.open(uintData, nonce, publicKeyUint, util.decodeBase64(this.spark.encryptionKeys.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = util.decodeBase64(sharedKey);
      decrypted = nacl.box.open.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = util.decodeBase64(this.spark.encryptionKeys.secretKey);
      decrypted = nacl.secretbox.open(uintData, nonce, secreKeyUint);
    }

    if (!decrypted) return null;
    const utf8Result = util.encodeUTF8(decrypted);
    const result = parseJSON(utf8Result) || utf8Result;
    return result;
  }
}
