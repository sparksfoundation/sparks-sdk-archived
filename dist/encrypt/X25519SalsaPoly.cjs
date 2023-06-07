'use strict';

var nacl = require('tweetnacl');
var util = require('tweetnacl-util');
var index_js = require('../utils/index.js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var nacl__default = /*#__PURE__*/_interopDefault(nacl);
var util__default = /*#__PURE__*/_interopDefault(util);

var X25519SalsaPoly_default = (Base) => class X25519SalsaPoly extends Base {
  constructor(...args) {
    super(...args);
  }
  /**
   * Computes a shared key using X25519SalsaPoly
   * @param {string} publicKey 
   * @returns {string} sharedKey
   */
  sharedKey({ publicKey }) {
    if (!this.keyPairs) {
      throw new Error("No key pairs found, please import or incept identity");
    }
    const baseEncryptionPublicKey = util__default.default.decodeBase64(publicKey);
    const baseEncryptionSecretKey = util__default.default.decodeBase64(this.keyPairs.encryption.secretKey);
    const uintSharedKey = nacl__default.default.box.before(baseEncryptionPublicKey, baseEncryptionSecretKey);
    const baseSharedKey = util__default.default.encodeBase64(uintSharedKey);
    return baseSharedKey;
  }
  /**
   * Encrypts data using X25519SalsaPoly
   * @param {object|string} data
   * @param {string} publicKey
   * @param {string} sharedKey
   * @returns {string}
   */
  encrypt({ data, publicKey, sharedKey }) {
    if (!this.keyPairs) {
      throw new Error("No key pairs found, please import or incept identity");
    }
    const utfData = typeof data === "string" ? data : JSON.stringify(data);
    const uintData = util__default.default.decodeUTF8(utfData);
    const nonce = nacl__default.default.randomBytes(nacl__default.default.box.nonceLength);
    let box;
    if (publicKey) {
      const publicKeyUint = util__default.default.decodeBase64(publicKey);
      box = nacl__default.default.box(uintData, nonce, publicKeyUint, util__default.default.decodeBase64(this.keyPairs.encryption.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = util__default.default.decodeBase64(sharedKey);
      box = nacl__default.default.box.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = util__default.default.decodeBase64(this.keyPairs.encryption.secretKey);
      box = nacl__default.default.secretbox(uintData, nonce, secreKeyUint);
    }
    const encrypted = new Uint8Array(nonce.length + box.length);
    encrypted.set(nonce);
    encrypted.set(box, nonce.length);
    return util__default.default.encodeBase64(encrypted);
  }
  /**
   * Decrypts data using X25519SalsaPoly
   * @param {string} data
   * @param {string} publicKey
   * @param {string} sharedKey
   * @returns {string}
   */
  decrypt({ data, publicKey, sharedKey }) {
    if (!this.keyPairs) {
      throw new Error("No key pairs found, please import or incept identity");
    }
    const uintDataAndNonce = util__default.default.decodeBase64(data);
    const nonce = uintDataAndNonce.slice(0, nacl__default.default.secretbox.nonceLength);
    const uintData = uintDataAndNonce.slice(nacl__default.default.secretbox.nonceLength, uintDataAndNonce.length);
    let decrypted;
    if (publicKey) {
      const publicKeyUint = util__default.default.decodeBase64(publicKey);
      decrypted = nacl__default.default.box.open(uintData, nonce, publicKeyUint, util__default.default.decodeBase64(this.keyPairs.encryption.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = util__default.default.decodeBase64(sharedKey);
      decrypted = nacl__default.default.box.open.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = util__default.default.decodeBase64(this.keyPairs.encryption.secretKey);
      decrypted = nacl__default.default.secretbox.open(uintData, nonce, secreKeyUint);
    }
    if (!decrypted) {
      throw new Error("Could not decrypt message");
    }
    const utf8Result = util__default.default.encodeUTF8(decrypted);
    const result = index_js.parseJSON(utf8Result) || utf8Result;
    return result;
  }
};

module.exports = X25519SalsaPoly_default;
