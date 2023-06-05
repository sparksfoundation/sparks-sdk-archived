'use strict';

var nacl = require('tweetnacl');
var util = require('tweetnacl-util');
var scrypt = require('scrypt-pbkdf');
var blake3 = require('@noble/hashes/blake3');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var nacl__default = /*#__PURE__*/_interopDefault(nacl);
var util__default = /*#__PURE__*/_interopDefault(util);
var scrypt__namespace = /*#__PURE__*/_interopNamespace(scrypt);

const generateSalt = (identity) => {
  return util__default.default.encodeBase64(blake3.blake3(JSON.stringify(identity)));
};
const signingKeyPair = async ({ password, identity }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const salt = generateSalt(identity);
  const buffer = await scrypt__namespace.scrypt(
    password,
    salt,
    nacl__default.default.box.secretKeyLength / 2,
    options
  );
  const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const uint8Seed = util__default.default.decodeUTF8(seed);
  const uint8Keypair = nacl__default.default.sign.keyPair.fromSeed(uint8Seed);
  return {
    publicKey: util__default.default.encodeBase64(uint8Keypair.publicKey),
    secretKey: util__default.default.encodeBase64(uint8Keypair.secretKey)
  };
};
const encryptionKeyPair = async ({ password, identity }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const salt = generateSalt(identity);
  const buffer = await scrypt__namespace.scrypt(
    password,
    salt,
    nacl__default.default.box.secretKeyLength / 2,
    options
  );
  const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const uint8Seed = util__default.default.decodeUTF8(seed);
  const uint8Keypair = nacl__default.default.box.keyPair.fromSecretKey(uint8Seed);
  return {
    publicKey: util__default.default.encodeBase64(uint8Keypair.publicKey),
    secretKey: util__default.default.encodeBase64(uint8Keypair.secretKey)
  };
};
const keyPairs = async ({ password, identity = "" }) => {
  return Promise.all([signingKeyPair({ password, identity }), encryptionKeyPair({ password, identity })]).then(([signing, encryption]) => {
    return {
      signing,
      encryption
    };
  });
};
var password_default = keyPairs;

module.exports = password_default;
