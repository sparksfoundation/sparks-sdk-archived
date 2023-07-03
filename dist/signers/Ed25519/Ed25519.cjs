"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ed25519 = void 0;
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var _tweetnaclUtil = _interopRequireDefault(require("tweetnacl-util"));
var _utilities = require("../../utilities/index.cjs");
var _CoreSigner = require("../CoreSigner.cjs");
var _signer = require("../../errors/signer.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Ed25519 extends _CoreSigner.CoreSigner {
  async import(data) {
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    return Promise.resolve(data);
  }
  async generateKeyPair(params) {
    try {
      const keyPair = params?.secretKey ? _tweetnacl.default.sign.keyPair.fromSecretKey(_tweetnaclUtil.default.decodeBase64(params?.secretKey)) : _tweetnacl.default.sign.keyPair();
      const publicKey = _tweetnaclUtil.default.encodeBase64(keyPair.publicKey);
      const secretKey = _tweetnaclUtil.default.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey) throw new Error("Failed to generate key pair.");
      return {
        publicKey,
        secretKey
      };
    } catch (error) {
      return Promise.reject(_signer.SignerErrors.GenerateSignerKeyPairError(error));
    }
  }
  async seal({
    data
  }) {
    try {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = _tweetnaclUtil.default.decodeUTF8(dataString);
      const uintSecretKey = _tweetnaclUtil.default.decodeBase64(this._secretKey);
      const signature = _tweetnaclUtil.default.encodeBase64(_tweetnacl.default.sign(uintData, uintSecretKey));
      if (!signature) throw new Error("Failed to seal signature.");
      return signature;
    } catch (error) {
      return Promise.reject(_signer.SignerErrors.MessageSealingError(error));
    }
  }
  async open({
    publicKey,
    signature
  }) {
    try {
      const uintSignature = _tweetnaclUtil.default.decodeBase64(signature);
      const uintPublicKey = _tweetnaclUtil.default.decodeBase64(publicKey);
      const uintResult = _tweetnacl.default.sign.open(uintSignature, uintPublicKey);
      if (!uintResult) throw new Error("invalid signature");
      const utf8Result = _tweetnaclUtil.default.encodeUTF8(uintResult);
      const data = (0, _utilities.parseJSON)(utf8Result) || utf8Result;
      if (!data) throw new Error("invalid utf8 encoding");
      return data;
    } catch (error) {
      console.log(error, "reason");
      return Promise.reject(_signer.SignerErrors.SignatureOpeningError(error));
    }
  }
  async sign({
    data
  }) {
    try {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = _tweetnaclUtil.default.decodeUTF8(dataString);
      const uintSecretKey = _tweetnaclUtil.default.decodeBase64(this._secretKey);
      const signature = _tweetnaclUtil.default.encodeBase64(_tweetnacl.default.sign.detached(uintData, uintSecretKey));
      if (!signature) throw new Error("Failed to sign data.");
      return signature;
    } catch (error) {
      return Promise.reject(_signer.SignerErrors.MessageSigningError(error));
    }
  }
  async verify({
    publicKey,
    signature,
    data
  }) {
    try {
      if (!data) throw new Error("Missing data to verify signature.");
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = _tweetnaclUtil.default.decodeUTF8(dataString);
      const uintSignature = _tweetnaclUtil.default.decodeBase64(signature);
      const uintPublicKey = _tweetnaclUtil.default.decodeBase64(publicKey);
      const verified = _tweetnacl.default.sign.detached.verify(uintData, uintSignature, uintPublicKey);
      if (typeof verified !== "boolean") throw new Error("Failed to check signature verification validity.");
      return verified;
    } catch (error) {
      return Promise.reject(_signer.SignerErrors.SignatureVerificationError(error));
    }
  }
}
exports.Ed25519 = Ed25519;