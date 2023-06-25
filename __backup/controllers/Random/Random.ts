import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { AController, KeyPairs } from '../Controller';
import { IRandom } from './types';

const signingKeyPair = () => {
  const signing = nacl.sign.keyPair();
  return {
    publicKey: util.encodeBase64(signing.publicKey),
    secretKey: util.encodeBase64(signing.secretKey),
  };
};

const encryptionKeyPair = () => {
  const encryption = nacl.box.keyPair();
  return {
    publicKey: util.encodeBase64(encryption.publicKey),
    secretKey: util.encodeBase64(encryption.secretKey),
  };
};

const generateKeyPairs = () => {
  return {
    signing: signingKeyPair(),
    encryption: encryptionKeyPair(),
  };
}

export class Random extends AController implements IRandom {
  private randomKeys: { keyPairs?: KeyPairs, nextKeyPairs?: KeyPairs };

  constructor(args) {
    super(args);
    this.randomKeys = {};
  }

  async incept(args: { backers?: Parameters<IRandom['incept']>[0]['backers']}) {
    const { backers = [] } = args || {};
    const keyPairs = generateKeyPairs();
    const nextKeyPairs = generateKeyPairs();
    this.randomKeys.keyPairs = keyPairs;
    this.randomKeys.nextKeyPairs = nextKeyPairs;
    await this.controller.incept({ keyPairs, nextKeyPairs, backers });
  }

  async rotate(args: { backers?: Parameters<IRandom['rotate']>[0]['backers']}) {
    const { backers = [] } = args || {};
    const keyPairs = { ...this.randomKeys.nextKeyPairs }
    const nextKeyPairs = generateKeyPairs();
    this.randomKeys = { keyPairs, nextKeyPairs };
    await this.controller.rotate({ keyPairs, nextKeyPairs, backers });
  }

  async delete(args: { backers?: Parameters<IRandom['delete']>[0]['backers']}) {
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
