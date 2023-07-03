"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.X25519SalsaPoly = void 0;
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var _tweetnaclUtil = _interopRequireDefault(require("tweetnacl-util"));
var _utilities = require("../../utilities/index.cjs");
var _CoreCipher = require("../CoreCipher.cjs");
var _cipher = require("../../errors/cipher.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class X25519SalsaPoly extends _CoreCipher.CoreCipher {
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
      const keyPair = params?.secretKey ? _tweetnacl.default.box.keyPair.fromSecretKey(_tweetnaclUtil.default.decodeBase64(params?.secretKey)) : _tweetnacl.default.box.keyPair();
      const publicKey = _tweetnaclUtil.default.encodeBase64(keyPair.publicKey);
      const secretKey = _tweetnaclUtil.default.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey) throw new Error("keyPair");
      return {
        publicKey,
        secretKey
      };
    } catch (error) {
      return Promise.reject(_cipher.CipherErrors.GetEncryptionKeypairError(error));
    }
  }
  async generateSharedKey({
    publicKey
  }) {
    try {
      const baseCipherPublicKey = _tweetnaclUtil.default.decodeBase64(publicKey);
      const baseCipherSecretKey = _tweetnaclUtil.default.decodeBase64(this._secretKey);
      const uintSharedKey = _tweetnacl.default.box.before(baseCipherPublicKey, baseCipherSecretKey);
      const baseSharedKey = _tweetnaclUtil.default.encodeBase64(uintSharedKey);
      if (!baseSharedKey) throw new Error();
      return baseSharedKey;
    } catch (error) {
      return Promise.reject(_cipher.CipherErrors.GenerateEncryptionSharedKeyError(error));
    }
  }
  async encrypt({
    data,
    publicKey,
    sharedKey
  }) {
    try {
      let box;
      const utfData = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = _tweetnaclUtil.default.decodeUTF8(utfData);
      const nonce = _tweetnacl.default.randomBytes(_tweetnacl.default.box.nonceLength);
      switch (true) {
        case publicKey !== void 0:
          const publicKeyUint = _tweetnaclUtil.default.decodeBase64(publicKey);
          box = _tweetnacl.default.box(uintData, nonce, publicKeyUint, _tweetnaclUtil.default.decodeBase64(this._secretKey));
          break;
        case sharedKey !== void 0:
          const sharedKeyUint = _tweetnaclUtil.default.decodeBase64(sharedKey);
          box = _tweetnacl.default.box.after(uintData, nonce, sharedKeyUint);
          break;
        default:
          const secreKeyUint = _tweetnaclUtil.default.decodeBase64(this._secretKey);
          box = _tweetnacl.default.secretbox(uintData, nonce, secreKeyUint);
          break;
      }
      const encrypted = new Uint8Array(nonce.length + box.length);
      encrypted.set(nonce);
      encrypted.set(box, nonce.length);
      const ciphertext = _tweetnaclUtil.default.encodeBase64(encrypted);
      if (!ciphertext) throw new Error("faild to encrypt");
      return ciphertext;
    } catch (error) {
      return Promise.reject(_cipher.CipherErrors.EncryptError(error));
    }
  }
  async decrypt({
    data,
    publicKey,
    sharedKey
  }) {
    try {
      const uintDataAndNonce = _tweetnaclUtil.default.decodeBase64(data);
      const nonce = uintDataAndNonce.slice(0, _tweetnacl.default.secretbox.nonceLength);
      const uintData = uintDataAndNonce.slice(_tweetnacl.default.secretbox.nonceLength, uintDataAndNonce.length);
      let decrypted;
      switch (true) {
        case publicKey !== void 0:
          const publicKeyUint = _tweetnaclUtil.default.decodeBase64(publicKey);
          decrypted = _tweetnacl.default.box.open(uintData, nonce, publicKeyUint, _tweetnaclUtil.default.decodeBase64(this._secretKey));
          break;
        case sharedKey !== void 0:
          const sharedKeyUint = _tweetnaclUtil.default.decodeBase64(sharedKey);
          decrypted = _tweetnacl.default.box.open.after(uintData, nonce, sharedKeyUint);
          break;
        default:
          const secreKeyUint = _tweetnaclUtil.default.decodeBase64(this._secretKey);
          decrypted = _tweetnacl.default.secretbox.open(uintData, nonce, secreKeyUint);
          break;
      }
      const utf8Result = _tweetnaclUtil.default.encodeUTF8(decrypted);
      const parsed = (0, _utilities.parseJSON)(utf8Result) || utf8Result;
      if (!parsed) throw new Error("faild to decrypt");
      return parsed;
    } catch (error) {
      return Promise.reject(_cipher.CipherErrors.DecryptError(error));
    }
  }
}
exports.X25519SalsaPoly = X25519SalsaPoly;