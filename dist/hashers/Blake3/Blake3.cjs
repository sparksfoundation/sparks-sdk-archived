"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Blake3 = void 0;
var _tweetnaclUtil = _interopRequireDefault(require("tweetnacl-util"));
var _Hasher = require("../Hasher/index.cjs");
var _blake = require("@noble/hashes/blake3");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Blake3 extends _Hasher.Hasher {
  async hash(data) {
    const stringData = typeof data !== "string" ? JSON.stringify(data) : data;
    return _tweetnaclUtil.default.encodeBase64((0, _blake.blake3)(stringData));
  }
}
exports.Blake3 = Blake3;