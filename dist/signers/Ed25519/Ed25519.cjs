"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ed25519 = void 0;
var _tweetnaclUtil = _interopRequireDefault(require("tweetnacl-util"));
var _Signer = require("../Signer/index.cjs");
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var _index = require("../../utilities/index.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Ed25519 extends _Signer.Signer {
  async sign({
    data,
    detached = false
  }) {
    const dataString = typeof data === "string" ? data : JSON.stringify(data);
    const uintData = _tweetnaclUtil.default.decodeUTF8(dataString);
    const uintSecretKey = _tweetnaclUtil.default.decodeBase64(this.spark.signingKeys.secretKey);
    const signature = detached ? _tweetnaclUtil.default.encodeBase64(_tweetnacl.default.sign.detached(uintData, uintSecretKey)) : _tweetnaclUtil.default.encodeBase64(_tweetnacl.default.sign(uintData, uintSecretKey));
    return signature;
  }
  async verify({
    publicKey,
    signature,
    data
  }) {
    if (!publicKey || !signature) throw new Error("publicKey and signature are required");
    if (data) {
      if (typeof data !== "string" && !(data instanceof Uint8Array)) {
        data = (0, _index.parseJSON)(data);
      }
      data = _tweetnaclUtil.default.decodeUTF8(data);
    }
    const uintSignature = _tweetnaclUtil.default.decodeBase64(signature);
    const uintPublicKey = _tweetnaclUtil.default.decodeBase64(publicKey);
    if (data) {
      return _tweetnacl.default.sign.detached.verify(data, uintSignature, uintPublicKey);
    } else {
      const uintResult = _tweetnacl.default.sign.open(uintSignature, uintPublicKey);
      if (uintResult === null) return uintResult;
      const utf8Result = _tweetnaclUtil.default.encodeUTF8(uintResult);
      return (0, _index.parseJSON)(utf8Result) || utf8Result;
    }
  }
}
exports.Ed25519 = Ed25519;