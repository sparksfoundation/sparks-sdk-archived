import { Controller } from "./controllers/index.mjs";
import { Agent } from "./agents/index.mjs";
import { Signer } from "./signers/index.mjs";
import { Cipher } from "./ciphers/index.mjs";
import { Hasher } from "./hashers/index.mjs";
export class Spark {
  constructor(options) {
    this.agents = {};
    this.cipher = new options.cipher(this);
    this.controller = new options.controller(this);
    this.hasher = new options.hasher(this);
    this.signer = new options.signer(this);
    const agents = options.agents || [];
    agents.forEach((agent) => {
      const mixin = new agent(this);
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
  get encryptionKeys() {
    return this.controller.encryptionKeys;
  }
  get signingKeys() {
    return this.controller.signingKeys;
  }
  get publicKeys() {
    return this.controller.publicKeys;
  }
  get keyPairs() {
    return this.controller.keyPairs;
  }
  get sign() {
    return this.signer.sign;
  }
  get verify() {
    return this.signer.verify;
  }
  get hash() {
    return this.hasher.hash;
  }
  get encrypt() {
    return this.cipher.encrypt;
  }
  get decrypt() {
    return this.cipher.decrypt;
  }
  get computeSharedKey() {
    return this.cipher.computeSharedKey;
  }
  get incept() {
    return this.controller.incept;
  }
  get rotate() {
    return this.controller.rotate;
  }
  get delete() {
    return this.controller.delete;
  }
}
class Test extends Agent {
  constructor() {
    super(...arguments);
    this.test = "test";
  }
}
const user = new Spark({
  agents: [Test],
  signer: Signer,
  cipher: Cipher,
  hasher: Hasher,
  controller: Controller
});
console.log(user.agents.test);
