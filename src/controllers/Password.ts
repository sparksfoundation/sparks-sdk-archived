import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import * as scrypt from 'scrypt-pbkdf';
import { blake3 } from '@noble/hashes/blake3';
import { Controller } from './Controller.js';
import { InceptionArgs, KeyEventLog, KeyPairs, SigningPublicKeyHash } from './types';

const generateSalt = (data) => {
  return util.encodeBase64(blake3(JSON.stringify(data)));
}

const signingKeyPair = async ({ password, salt }) => {
  return generateKeyPair({
    password: password,
    salt: salt,
    naclFunc: nacl.sign.keyPair.fromSeed
  });
};

const encryptionKeyPair = async ({ password, salt }) => {
  return generateKeyPair({
    password: password,
    salt: salt,
    naclFunc: nacl.box.keyPair.fromSecretKey
  });
};

const generateKeyPair = async ({ password, salt, naclFunc }) => {
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
  const uint8Keypair = naclFunc(uint8Seed);

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

export class Password extends Controller {
  async incept(args) {
    const { password } = args;
    let salt = util.encodeBase64(nacl.randomBytes(16));
    const keyPairs = await generateKeyPairs({ password, salt });
    salt = generateSalt(keyPairs.signing.publicKey);
    const nextKeyPairs = await generateKeyPairs({ password, salt });
    await super.incept({ keyPairs, nextKeyPairs, ...args } as InceptionArgs);
    // rotate to the first key so that we can maintain salts
    await this.rotate({ password });
  }

  async import(args) {
    const { password, salt, data } = args;
    const keyPairs = await generateKeyPairs({ password, salt });
    await super.import({ keyPairs, data });
  }

  async export() {
    const kel = this.keyEventLog;
    const salt = generateSalt(this.getSaltInput(kel));
    const data = await super.export();
    return { data, salt };
  }

  async rotate(args) {
    const { password, newPassword } = args;
    const eventLog: KeyEventLog = this.keyEventLog;
    let salt: string, nextKeyPairs: KeyPairs, keyPairs: KeyPairs, keyHash: SigningPublicKeyHash;

    if (!password) throw new Error('Password is required to rotate keys.');

    // if there's only one event, we need to generate a salt from the original signing key otherwise we can use the last event which will be more random
    salt = generateSalt(eventLog.length < 2 ? eventLog[0].signingKeys[0] : eventLog[eventLog.length - 2]);
    keyPairs = await generateKeyPairs({ password, salt });
    keyHash = await this.spark.hasher.hash(keyPairs.signing.publicKey);

    if (keyHash !== this.getLastEvent(eventLog).nextKeyCommitments[0]) {
      throw new Error('Key commitment does not match your previous commitment. If you are trying to change your password provide password & newPassword parameters.');
    }

    salt = generateSalt(this.getLastEvent(eventLog));
    nextKeyPairs = await generateKeyPairs({ password: newPassword || password, salt });

    await super.rotate({ keyPairs, nextKeyPairs, ...args });

    if (newPassword) {
      return await this.rotate({ password: newPassword });
    }
  }

  getSaltInput(kel: KeyEventLog) {
    const inceptionOnly = kel.length < 2;
    const hasOneRotation = kel.length < 3;

    if (hasOneRotation) {
      return this.getInceptionEvent(kel).signingKeys[0]
    } else if (inceptionOnly) {
      return this.getInceptionEvent(kel).signingKeys[0]
    } else {
      const rotationEvent = kel[kel.length - 3];
      return rotationEvent;
    }
  }

  getLastEvent(kel: KeyEventLog) {
    return kel[kel.length - 1];
  }

  getInceptionEvent(kel: KeyEventLog) {
    return kel[0];
  }
}
