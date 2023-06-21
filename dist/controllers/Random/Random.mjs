import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { AController } from "../Controller/index.mjs";
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
export class Random extends AController {
  constructor(args) {
    super(args);
    this.randomKeys = {};
  }
  async incept(args) {
    const { backers = [] } = args || {};
    const keyPairs = generateKeyPairs();
    const nextKeyPairs = generateKeyPairs();
    this.randomKeys.keyPairs = keyPairs;
    this.randomKeys.nextKeyPairs = nextKeyPairs;
    await this.controller.incept({ keyPairs, nextKeyPairs, backers });
  }
  async rotate(args) {
    const { backers = [] } = args || {};
    const keyPairs = { ...this.randomKeys.nextKeyPairs };
    const nextKeyPairs = generateKeyPairs();
    this.randomKeys = { keyPairs, nextKeyPairs };
    await this.controller.rotate({ keyPairs, nextKeyPairs, backers });
  }
  async delete(args) {
    const { backers = [] } = args || {};
    await this.controller.delete({ backers });
  }
  async import({ data }) {
    await this.controller.import({ keyPairs: this.randomKeys.keyPairs, data });
  }
  async export() {
    await this.controller.export();
  }
}
