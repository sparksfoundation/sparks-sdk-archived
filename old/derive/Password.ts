import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import * as scrypt from 'scrypt-pbkdf';
import { blake3 } from '@noble/hashes/blake3';

const generateSalt = (data) => {
  return util.encodeBase64(blake3(JSON.stringify(data)));
}

const signingKeyPair = async ({ password, salt }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const buffer = await scrypt.scrypt(
    password,
    salt,
    nacl.box.secretKeyLength / 2,
    options,
  );
  const seed = [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');

  const uint8Seed = util.decodeUTF8(seed);
  const uint8Keypair = nacl.sign.keyPair.fromSeed(uint8Seed);

  return {
    publicKey: util.encodeBase64(uint8Keypair.publicKey),
    secretKey: util.encodeBase64(uint8Keypair.secretKey),
  };
};

const encryptionKeyPair = async ({ password, salt }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const buffer = await scrypt.scrypt(
    password,
    salt,
    nacl.box.secretKeyLength / 2,
    options,
  );
  const seed = [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');

  const uint8Seed = util.decodeUTF8(seed);
  const uint8Keypair = nacl.box.keyPair.fromSecretKey(uint8Seed);

  return {
    publicKey: util.encodeBase64(uint8Keypair.publicKey),
    secretKey: util.encodeBase64(uint8Keypair.secretKey),
  };
};

const generateKeyPairs = async ({ password, salt }) => {
  return Promise.all([signingKeyPair({ password, salt }), encryptionKeyPair({ password, salt })]).then(([signing, encryption]) => {
    return {
      signing,
      encryption,
    };
  });
}

const Password = Base => class Password extends Base {
  constructor(...args) {
    super(...args);
  }

  async incept({ password }) {
    let salt = util.encodeBase64(nacl.randomBytes(16));
    const keyPairs = await generateKeyPairs({ password, salt });
    salt = generateSalt(keyPairs.signing.publicKey);
    const nextKeyPairs = await generateKeyPairs({ password, salt });
    super.incept({ keyPairs, nextKeyPairs });
    // rotate to the first key so that we can maintain salts
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

  async rotate({ password, newPassword }: { password: string, newPassword?: string }) {
    const eventLog = this.keyEventLog;
    let salt, nextKeyPairs, keyPairs, keyHash;

    if (!password) throw new Error('Password is required to rotate keys.');

    // if there's only one event, we need to generate a salt from the original signing key otherwise we can use the last event which will be more random
    salt = await generateSalt(eventLog.length < 2 ? eventLog[0].signingKeys[0] : eventLog[eventLog.length - 2]);
    keyPairs = await generateKeyPairs({ password, salt });
    keyHash = this.hash(keyPairs.signing.publicKey);

    if (keyHash !== eventLog[eventLog.length - 1].nextKeyCommitments[0]) {
      throw new Error('Key commitment does not match your previous commitment. If you are trying to change your password provide password & newPassword parameters.');
    }

    salt = generateSalt(eventLog[eventLog.length - 1]);
    nextKeyPairs = await generateKeyPairs({ password: newPassword || password, salt });

    super.rotate({ keyPairs, nextKeyPairs });

    if (newPassword) {
      return await this.rotate({ password: newPassword });
    }
  }
};

Password.type = 'derive';

export default Password;