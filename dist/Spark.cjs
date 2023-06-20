"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Spark = void 0;
class Spark {
  constructor(options) {
    this.agents = {};
    this.cipher = new options.cipher(this);
    this.controller = new options.controller(this);
    this.hasher = new options.hasher(this);
    this.signer = new options.signer(this);
    const agents = options.agents || [];
    agents.forEach(agent => {
      const mixin = new agent(this);
      this.agents[agent.name.toLowerCase()] = mixin;
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
  sign(args) {
    return this.signer.sign(args);
  }
  verify(args) {
    return this.signer.verify(args);
  }
  hash(args) {
    return this.hasher.hash(args);
  }
  incept(args) {
    return this.controller.incept(args);
  }
  rotate(args) {
    return this.controller.rotate(args);
  }
  delete(args) {
    return this.controller.delete(args);
  }
  encrypt(args) {
    return this.cipher.encrypt(args);
  }
  decrypt(args) {
    return this.cipher.decrypt(args);
  }
  import(args) {
    return this.controller.import(args);
  }
  export(args) {
    return this.controller.export(args);
  }
  computeSharedKey(args) {
    return this.cipher.computeSharedKey(args);
  }
}
exports.Spark = Spark;