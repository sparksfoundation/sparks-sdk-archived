'use strict';

var nacl = require('tweetnacl');
var util = require('tweetnacl-util');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var nacl__default = /*#__PURE__*/_interopDefault(nacl);
var util__default = /*#__PURE__*/_interopDefault(util);

const signingKeyPair = () => {
  const signing = nacl__default.default.sign.keyPair();
  return {
    publicKey: util__default.default.encodeBase64(signing.publicKey),
    secretKey: util__default.default.encodeBase64(signing.secretKey)
  };
};
const encryptionKeyPair = () => {
  const encryption = nacl__default.default.box.keyPair();
  return {
    publicKey: util__default.default.encodeBase64(encryption.publicKey),
    secretKey: util__default.default.encodeBase64(encryption.secretKey)
  };
};
const generateKeyPairs = () => {
  return {
    signing: signingKeyPair(),
    encryption: encryptionKeyPair()
  };
};
var Random_default = (Base, symbols) => class Password extends Base {
  #randomKeyPairs = [];
  constructor(...args) {
    super(...args);
  }
  incept() {
    const keyPairs = generateKeyPairs();
    const nextKeyPairs = generateKeyPairs();
    this.#randomKeyPairs = [keyPairs, nextKeyPairs];
    super.incept({ keyPairs, nextKeyPairs });
  }
  rotate() {
    const keyPairs = { ...this.#randomKeyPairs[this.#randomKeyPairs.length - 1] };
    const nextKeyPairs = generateKeyPairs();
    this.#randomKeyPairs.push(nextKeyPairs);
    super.rotate({ keyPairs, nextKeyPairs });
  }
};

module.exports = Random_default;
