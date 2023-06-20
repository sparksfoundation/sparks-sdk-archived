import nacl from "tweetnacl";
import util from "tweetnacl-util";
import * as scrypt from "scrypt-pbkdf";
import { blake3 } from "@noble/hashes/blake3";
import { Controller } from "../Controller/Controller.mjs";
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
export class Password extends Controller {
  async incept(args) {
    const { password } = args;
    let salt = util.encodeBase64(nacl.randomBytes(16));
    const keyPairs = await generateKeyPairs({ password, salt });
    salt = generateSalt(keyPairs.signing.publicKey);
    const nextKeyPairs = await generateKeyPairs({ password, salt });
    await super.incept({ ...args, keyPairs, nextKeyPairs });
    await this.rotate({ ...args, password, newPassword: null });
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
    const eventLog = this.keyEventLog;
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
    await super.rotate({ ...args, keyPairs, nextKeyPairs });
    if (newPassword) {
      return await this.rotate({ ...args, password: newPassword });
    }
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