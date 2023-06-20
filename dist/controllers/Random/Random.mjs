import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { Controller } from "../Controller/Controller.mjs";
const signingKeyPair = () => {
  const signing = nacl.sign.keyPair();
  return {
    publicKey: util.encodeBase64(signing.publicKey),
    secretKey: util.encodeBase64(signing.secretKey)
  };
};
const encryptionKeyPair = () => {
  const encryption = nacl.box.keyPair();
  return {
    publicKey: util.encodeBase64(encryption.publicKey),
    secretKey: util.encodeBase64(encryption.secretKey)
  };
};
const generateKeyPairs = () => {
  return {
    signing: signingKeyPair(),
    encryption: encryptionKeyPair()
  };
};
export class Random extends Controller {
  constructor() {
    super(...arguments);
    this.randomKeyPairs = [];
  }
  async incept(args) {
    const keyPairs = generateKeyPairs();
    const nextKeyPairs = generateKeyPairs();
    this.randomKeyPairs = [keyPairs, nextKeyPairs];
    await super.incept({ ...args, keyPairs, nextKeyPairs });
  }
  async rotate(args) {
    const keyPairs = { ...this.randomKeyPairs[this.randomKeyPairs.length - 1] };
    const nextKeyPairs = generateKeyPairs();
    this.randomKeyPairs.push(nextKeyPairs);
    await super.rotate({ ...args, keyPairs, nextKeyPairs });
  }
  async import(args) {
    await super.import({ ...args });
  }
}
