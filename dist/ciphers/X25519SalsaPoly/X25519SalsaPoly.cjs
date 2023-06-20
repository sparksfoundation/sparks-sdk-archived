"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.X25519SalsaPoly = void 0;
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var _tweetnaclUtil = _interopRequireDefault(require("tweetnacl-util"));
var _Cipher = require("../Cipher/Cipher.cjs");
var _index = require("../../utilities/index.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class X25519SalsaPoly extends _Cipher.Cipher {
  async computeSharedKey({
    publicKey
  }) {
    if (!this.spark.encryptionKeys) {
      throw new Error("No key pairs found, please import or incept identity");
    }
    const baseEncryptionPublicKey = _tweetnaclUtil.default.decodeBase64(publicKey);
    const baseEncryptionSecretKey = _tweetnaclUtil.default.decodeBase64(this.spark.encryptionKeys.secretKey);
    const uintSharedKey = _tweetnacl.default.box.before(baseEncryptionPublicKey, baseEncryptionSecretKey);
    const baseSharedKey = _tweetnaclUtil.default.encodeBase64(uintSharedKey);
    return baseSharedKey;
  }
  async encrypt({
    data,
    publicKey,
    sharedKey
  }) {
    if (!this.spark.encryptionKeys) {
      throw new Error("No key pairs found, please import or incept identity");
    }
    const utfData = typeof data === "string" ? data : JSON.stringify(data);
    const uintData = _tweetnaclUtil.default.decodeUTF8(utfData);
    const nonce = _tweetnacl.default.randomBytes(_tweetnacl.default.box.nonceLength);
    let box;
    if (publicKey) {
      const publicKeyUint = _tweetnaclUtil.default.decodeBase64(publicKey);
      box = _tweetnacl.default.box(uintData, nonce, publicKeyUint, _tweetnaclUtil.default.decodeBase64(this.spark.encryptionKeys.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = _tweetnaclUtil.default.decodeBase64(sharedKey);
      box = _tweetnacl.default.box.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = _tweetnaclUtil.default.decodeBase64(this.spark.encryptionKeys.secretKey);
      box = _tweetnacl.default.secretbox(uintData, nonce, secreKeyUint);
    }
    const encrypted = new Uint8Array(nonce.length + box.length);
    encrypted.set(nonce);
    encrypted.set(box, nonce.length);
    return _tweetnaclUtil.default.encodeBase64(encrypted);
  }
  async decrypt({
    data,
    publicKey,
    sharedKey
  }) {
    if (!this.spark.keyPairs) {
      throw new Error("No key pairs found, please import or incept identity");
    }
    const uintDataAndNonce = _tweetnaclUtil.default.decodeBase64(data);
    const nonce = uintDataAndNonce.slice(0, _tweetnacl.default.secretbox.nonceLength);
    const uintData = uintDataAndNonce.slice(_tweetnacl.default.secretbox.nonceLength, uintDataAndNonce.length);
    let decrypted;
    if (publicKey) {
      const publicKeyUint = _tweetnaclUtil.default.decodeBase64(publicKey);
      decrypted = _tweetnacl.default.box.open(uintData, nonce, publicKeyUint, _tweetnaclUtil.default.decodeBase64(this.spark.encryptionKeys.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = _tweetnaclUtil.default.decodeBase64(sharedKey);
      decrypted = _tweetnacl.default.box.open.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = _tweetnaclUtil.default.decodeBase64(this.spark.encryptionKeys.secretKey);
      decrypted = _tweetnacl.default.secretbox.open(uintData, nonce, secreKeyUint);
    }
    if (!decrypted) return null;
    const utf8Result = _tweetnaclUtil.default.encodeUTF8(decrypted);
    const result = (0, _index.parseJSON)(utf8Result) || utf8Result;
    return result;
  }
}
exports.X25519SalsaPoly = X25519SalsaPoly;