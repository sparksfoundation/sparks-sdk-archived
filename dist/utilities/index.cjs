"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTimestamp = getTimestamp;
exports.parseJSON = parseJSON;
exports.randomNonce = randomNonce;
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var _tweetnaclUtil = _interopRequireDefault(require("tweetnacl-util"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function getTimestamp() {
  const now = /* @__PURE__ */new Date();
  return now.getTime() + now.getTimezoneOffset() * 60 * 1e3;
}
function parseJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}
function randomNonce(len) {
  return _tweetnaclUtil.default.encodeBase64(_tweetnacl.default.randomBytes(_tweetnacl.default.secretbox.nonceLength));
}