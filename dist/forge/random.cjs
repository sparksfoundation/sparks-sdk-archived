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
const keyPairs = () => {
  return {
    signing: signingKeyPair(),
    encryption: encryptionKeyPair()
  };
};
var random_default = keyPairs;

module.exports = random_default;
