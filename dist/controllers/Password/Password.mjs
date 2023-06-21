import nacl from "tweetnacl";
import util from "tweetnacl-util";
import * as scrypt from "scrypt-pbkdf";
import { blake3 } from "@noble/hashes/blake3";
import { AController } from "../Controller/types.mjs";
const generateSalt = (data) => {
  return util.encodeBase64(blake3(JSON.stringify(data)));
};
const signingKeyPair = async ({ password, salt }) => {
  return generateKeyPair({
    password,
    salt,
    naclFunc: nacl.sign.keyPair.fromSeed
  });
};
const encryptionKeyPair = async ({ password, salt }) => {
  return generateKeyPair({
    password,
    salt,
    naclFunc: nacl.box.keyPair.fromSecretKey
  });
};
const generateKeyPair = async ({ password, salt, naclFunc }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const buffer = await scrypt.scrypt(
    password,
    salt,
    nacl.box.secretKeyLength / 2,
    options
  );
  const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const uint8Seed = util.decodeUTF8(seed);
  const uint8Keypair = naclFunc(uint8Seed);
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
export class Password extends AController {
  async incept({ password, backers = [] }) {
    let salt = util.encodeBase64(nacl.randomBytes(16));
    const keyPairs = await generateKeyPairs({ password, salt });
    salt = generateSalt(keyPairs.signing.publicKey);
    const nextKeyPairs = await generateKeyPairs({ password, salt });
    await this.controller.incept({ keyPairs, nextKeyPairs, backers });
    await this.rotate({ password, backers });
  }
  async import({ password, salt, data }) {
    const keyPairs = await generateKeyPairs({ password, salt });
    await this.controller.import({ keyPairs, data });
  }
  async export() {
    const kel = this.controller.keyEventLog;
    const salt = generateSalt(this.getSaltInput(kel));
    const data = await this.controller.export();
    return { data, salt };
  }
  async rotate({ password, newPassword, backers = [] }) {
    const eventLog = this.controller.keyEventLog;
    let salt, nextKeyPairs, keyPairs, keyHash;
    if (!password)
      throw new Error("Password is required to rotate keys.");
    salt = generateSalt(this.inceptionOnly(eventLog) ? this.inceptionEventSigningKeys(eventLog) : eventLog[eventLog.length - 2]);
    keyPairs = await generateKeyPairs({ password, salt });
    keyHash = await this.spark.hash(keyPairs.signing.publicKey);
    if (keyHash !== this.getLastEvent(eventLog).nextKeyCommitments[0]) {
      throw new Error("Key commitment does not match your previous commitment. If you are trying to change your password provide password & newPassword parameters.");
    }
    salt = generateSalt(this.getLastEvent(eventLog));
    nextKeyPairs = await generateKeyPairs({ password: newPassword || password, salt });
    await this.controller.rotate({ keyPairs, nextKeyPairs, backers });
    if (newPassword) {
      return await this.rotate({ password: newPassword, backers });
    }
  }
  async delete(args) {
    const { backers = [] } = args || {};
    await this.controller.delete({ backers });
  }
  getSaltInput(kel) {
    const hasOneRotation = kel.length < 3;
    if (this.inceptionOnly(kel) || hasOneRotation) {
      return this.inceptionEventSigningKeys(kel);
    } else {
      const rotationEvent = kel[kel.length - 3];
      return rotationEvent;
    }
  }
  inceptionEventSigningKeys(kel) {
    return this.getInceptionEvent(kel).signingKeys[0];
  }
  inceptionOnly(kel) {
    return 2 > kel.length;
  }
  getLastEvent(kel) {
    return kel[kel.length - 1];
  }
  getInceptionEvent(kel) {
    return kel[0];
  }
}
