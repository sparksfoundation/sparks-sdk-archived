import { SparkError } from "./errors/index.mjs";
import { Controller } from "./controller/index.mjs";
export class Spark {
  constructor({
    agents = [],
    cipher,
    hasher,
    signer
  }) {
    this.agents = {};
    this.cipher = new cipher();
    this.controller = new Controller();
    this.hasher = new hasher();
    this.signer = new signer();
    agents.forEach((agent) => {
      const mixin = new agent();
      const name = agent.name.charAt(0).toLowerCase() + agent.name.slice(1);
      this.agents[name] = mixin;
    });
  }
  get identifier() {
    return this.controller.identifier;
  }
  get keyEventLog() {
    return this.controller.keyEventLog;
  }
  get keyPairs() {
    const encryption = this.encryptionKeys();
    const signing = this.signingKeys();
    if (encryption instanceof SparkError)
      return encryption;
    if (signing instanceof SparkError)
      return signing;
    return { encryption, signing };
  }
  get publicKeys() {
    const encryption = this.encryptionKeys();
    const signing = this.signingKeys();
    if (encryption instanceof SparkError)
      return encryption;
    if (signing instanceof SparkError)
      return signing;
    return {
      encryption: encryption.publicKey,
      signing: signing.publicKey
    };
  }
  get secretKeys() {
    const encryption = this.encryptionKeys();
    const signing = this.signingKeys();
    if (encryption instanceof SparkError)
      return encryption;
    if (signing instanceof SparkError)
      return signing;
    return {
      encryption: encryption.secretKey,
      signing: signing.secretKey
    };
  }
  get encryptionKeys() {
    return this.cipher.getKeyPair;
  }
  get signingKeys() {
    return this.signer.getKeyPair;
  }
  get initEncryptionKeys() {
    return this.cipher.initKeyPair;
  }
  get computSharedEncryptionKey() {
    return this.cipher.computeSharedKey;
  }
  get encrypt() {
    return this.cipher.encrypt;
  }
  get decrypt() {
    return this.cipher.decrypt;
  }
  get hash() {
    return this.hasher.hash;
  }
  get initSingingKeys() {
    return this.signer.initKeyPair;
  }
  get sign() {
    return this.signer.sign;
  }
  get seal() {
    return this.signer.seal;
  }
  get verify() {
    return this.signer.verify;
  }
  get open() {
    return this.signer.open;
  }
  get incept() {
    return this.controller.incept;
  }
  get rotate() {
    return this.controller.rotate;
  }
  get destroy() {
    return this.controller.destroy;
  }
  import(data) {
    return Promise.resolve();
  }
  export() {
    return Promise.resolve("");
  }
}
