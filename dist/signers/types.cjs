"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SignerType = void 0;
var SignerType = /* @__PURE__ */(SignerType2 => {
  SignerType2["CORE_SIGNER"] = "CORE_SIGNER";
  SignerType2["ED25519_SIGNER"] = "ED25519_SIGNER";
  SignerType2["ED25519_PASSWORD_SIGNER"] = "ED25519_PASSWORD_SIGNER";
  return SignerType2;
})(SignerType || {});
exports.SignerType = SignerType;