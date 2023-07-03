"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Blake3 = void 0;
var _tweetnaclUtil = _interopRequireDefault(require("tweetnacl-util"));
var _CoreHasher = require("../CoreHasher.cjs");
var _blake = require("@noble/hashes/blake3");
var _hasher = require("../../errors/hasher.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Blake3 extends _CoreHasher.CoreHasher {
  async import(data) {
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    return Promise.resolve(data);
  }
  async hash({
    data
  }) {
    try {
      const stringData = typeof data !== "string" ? JSON.stringify(data) : data;
      const digest = _tweetnaclUtil.default.encodeBase64((0, _blake.blake3)(stringData));
      return digest;
    } catch (error) {
      return Promise.reject(_hasher.HasherErrors.HashingFailure(error));
    }
  }
}
exports.Blake3 = Blake3;