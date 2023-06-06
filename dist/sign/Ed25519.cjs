'use strict';

var nacl = require('tweetnacl');
var util = require('tweetnacl-util');
var index_js = require('../utils/index.js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var nacl__default = /*#__PURE__*/_interopDefault(nacl);
var util__default = /*#__PURE__*/_interopDefault(util);

var Ed25519_default = (Base, symbols) => class Ed25519 extends Base {
  constructor(...args) {
    super(...args);
  }
  /**
   * Signs data using ed25519
   * @param {object|string} data
   * @param {boolean} detached
   * @returns {string}
   */
  sign({ data, detached = false }) {
    if (typeof data !== "string") {
      data = index_js.parseJSON(data);
    }
    const uintData = util__default.default.decodeUTF8(data);
    const uintSecretKey = util__default.default.decodeBase64(this[symbols.keyPairs].signing.secretKey);
    const signature = detached ? util__default.default.encodeBase64(nacl__default.default.sign.detached(uintData, uintSecretKey)) : util__default.default.encodeBase64(nacl__default.default.sign(uintData, uintSecretKey));
    return signature;
  }
  /**
   * Verifies data using ed25519
   * @param {string} publicKey
   * @param {string} signature
   * @param {object|string} data
   * @returns {boolean|object|string}
   */
  verify({ publicKey, signature, data }) {
    if (data) {
      if (typeof data !== "string" && !(data instanceof Uint8Array)) {
        data = index_js.parseJSON(data);
      }
      data = util__default.default.decodeUTF8(data);
    }
    const uintSignature = util__default.default.decodeBase64(signature);
    const uintPublicKey = util__default.default.decodeBase64(publicKey);
    if (data) {
      return nacl__default.default.sign.detached.verify(data, uintSignature, uintPublicKey);
    } else {
      const uintResult = nacl__default.default.sign.open(uintSignature, uintPublicKey);
      if (uintResult === null)
        return uintResult;
      const utf8Result = util__default.default.encodeUTF8(uintResult);
      return index_js.parseJSON(utf8Result) || utf8Result;
    }
  }
};

module.exports = Ed25519_default;
