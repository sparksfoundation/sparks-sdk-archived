"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseJSON = parseJSON;
exports.randomSalt = randomSalt;
exports.utcEpochTimestamp = utcEpochTimestamp;
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var _tweetnaclUtil = _interopRequireDefault(require("tweetnacl-util"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function utcEpochTimestamp() {
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
function randomSalt() {
  return _tweetnaclUtil.default.encodeBase64(_tweetnacl.default.randomBytes(32));
}