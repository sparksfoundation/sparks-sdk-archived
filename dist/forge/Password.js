import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import * as scrypt from 'scrypt-pbkdf';
import { blake3 } from '@noble/hashes/blake3';

const generateSalt = (data) => {
  return util.encodeBase64(blake3(JSON.stringify(data)));
};
const signingKeyPair = async ({ password, salt }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const buffer = await scrypt.scrypt(
    password,
    salt,
    nacl.box.secretKeyLength / 2,
    options
  );
  const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const uint8Seed = util.decodeUTF8(seed);
  const uint8Keypair = nacl.sign.keyPair.fromSeed(uint8Seed);
  return {
    publicKey: util.encodeBase64(uint8Keypair.publicKey),
    secretKey: util.encodeBase64(uint8Keypair.secretKey)
  };
};
const encryptionKeyPair = async ({ password, salt }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const buffer = await scrypt.scrypt(
    password,
    salt,
    nacl.box.secretKeyLength / 2,
    options
  );
  const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const uint8Seed = util.decodeUTF8(seed);
  const uint8Keypair = nacl.box.keyPair.fromSecretKey(uint8Seed);
  return {
    publicKey: util.encodeBase64(uint8Keypair.publicKey),
    secretKey: util.encodeBase64(uint8Keypair.secretKey)
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
var Password_default = (Base, symbols) => class Password extends Base {
  constructor(...args) {
    super(...args);
  }
  async incept({ password }) {
    let salt = util.encodeBase64(nacl.randomBytes(16));
    const keyPairs = await generateKeyPairs({ password, salt });
    salt = generateSalt(keyPairs);
    const nextKeyPairs = await generateKeyPairs({ password, salt });
    super.incept({ keyPairs, nextKeyPairs });
  }
  async rotate({ password, newPassword }) {
    const eventLog = this[symbols.keyEventLog];
    const manyEvents = eventLog.length;
    let salt, nextKeyPairs, keyPairs, keyHash;
    if (!password)
      throw new Error("Password is required to rotate keys.");
    salt = await generateSalt(manyEvents < 2 ? this[symbols.keyPairs] : eventLog[manyEvents - 2]);
    keyPairs = await generateKeyPairs({ password, salt });
    keyHash = this.hash(keyPairs.signing.publicKey);
    if (keyHash !== eventLog[eventLog.length - 1].nextKeyCommitments[0]) {
      throw new Error("Key commitment does not match your previous commitment. If you are trying to change your password provide password & newPassword parameters.");
    }
    salt = generateSalt(eventLog[manyEvents - 1]);
    nextKeyPairs = await generateKeyPairs({ password: newPassword || password, salt });
    super.rotate({ keyPairs, nextKeyPairs });
    if (newPassword) {
      return await this.rotate({ password: newPassword });
    }
  }
};

export { Password_default as default };