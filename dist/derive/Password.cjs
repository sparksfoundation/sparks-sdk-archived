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

const generateSalt = (data) => {
  return util__default.default.encodeBase64(blake3.blake3(JSON.stringify(data)));
};
const signingKeyPair = async ({ password, salt }) => {
  const options = { N: 16384, r: 8, p: 1 };
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
const encryptionKeyPair = async ({ password, salt }) => {
  const options = { N: 16384, r: 8, p: 1 };
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
const generateKeyPairs = async ({ password, salt }) => {
  return Promise.all([signingKeyPair({ password, salt }), encryptionKeyPair({ password, salt })]).then(([signing, encryption]) => {
    return {
      signing,
      encryption
    };
  });
};
const Password = (Base) => class Password extends Base {
  constructor(...args) {
    super(...args);
  }
  async incept({ password }) {
    let salt = util__default.default.encodeBase64(nacl__default.default.randomBytes(16));
    const keyPairs = await generateKeyPairs({ password, salt });
    salt = generateSalt(keyPairs.signing.publicKey);
    const nextKeyPairs = await generateKeyPairs({ password, salt });
    super.incept({ keyPairs, nextKeyPairs });
    await this.rotate({ password });
  }
  async import({ password, salt, data }) {
    const keyPairs = await generateKeyPairs({ password, salt });
    super.import({ keyPairs, data });
  }
  async export() {
    const kel = this.keyEventLog;
    const salt = await generateSalt(kel.length < 3 ? kel[0].signingKeys[0] : kel[kel.length - 3]);
    const data = super.export();
    return { data, salt };
  }
  async rotate({ password, newPassword }) {
    const eventLog = this.keyEventLog;
    let salt, nextKeyPairs, keyPairs, keyHash;
    if (!password)
      throw new Error("Password is required to rotate keys.");
    salt = await generateSalt(eventLog.length < 2 ? eventLog[0].signingKeys[0] : eventLog[eventLog.length - 2]);
    keyPairs = await generateKeyPairs({ password, salt });
    keyHash = this.hash(keyPairs.signing.publicKey);
    if (keyHash !== eventLog[eventLog.length - 1].nextKeyCommitments[0]) {
      throw new Error("Key commitment does not match your previous commitment. If you are trying to change your password provide password & newPassword parameters.");
    }
    salt = generateSalt(eventLog[eventLog.length - 1]);
    nextKeyPairs = await generateKeyPairs({ password: newPassword || password, salt });
    super.rotate({ keyPairs, nextKeyPairs });
    if (newPassword) {
      return await this.rotate({ password: newPassword });
    }
  }
};
Password.type = "derive";
var Password_default = Password;

module.exports = Password_default;
