"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Random = void 0;
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var _tweetnaclUtil = _interopRequireDefault(require("tweetnacl-util"));
var _Controller = require("../Controller/Controller.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const signingKeyPair = () => {
  const signing = _tweetnacl.default.sign.keyPair();
  return {
    publicKey: _tweetnaclUtil.default.encodeBase64(signing.publicKey),
    secretKey: _tweetnaclUtil.default.encodeBase64(signing.secretKey)
  };
};
const encryptionKeyPair = () => {
  const encryption = _tweetnacl.default.box.keyPair();
  return {
    publicKey: _tweetnaclUtil.default.encodeBase64(encryption.publicKey),
    secretKey: _tweetnaclUtil.default.encodeBase64(encryption.secretKey)
  };
};
const generateKeyPairs = () => {
  return {
    signing: signingKeyPair(),
    encryption: encryptionKeyPair()
  };
};
class Random extends _Controller.Controller {
  constructor() {
    super(...arguments);
    this.randomKeyPairs = [];
  }
  async incept(args) {
    const keyPairs = generateKeyPairs();
    const nextKeyPairs = generateKeyPairs();
    this.randomKeyPairs = [keyPairs, nextKeyPairs];
    await super.incept({
      ...args,
      keyPairs,
      nextKeyPairs
    });
  }
  async rotate(args) {
    const keyPairs = {
      ...this.randomKeyPairs[this.randomKeyPairs.length - 1]
    };
    const nextKeyPairs = generateKeyPairs();
    this.randomKeyPairs.push(nextKeyPairs);
    await super.rotate({
      ...args,
      keyPairs,
      nextKeyPairs
    });
  }
  async import(args) {
    await super.import({
      ...args
    });
  }
}
exports.Random = Random;