"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CipherType = void 0;
var CipherType = /* @__PURE__ */(CipherType2 => {
  CipherType2["CORE_CIPHER"] = "CORE_CIPHER";
  CipherType2["X25519_SALSA_POLY_CIPHER"] = "X25519_SALSA_POLY_CIPHER";
  CipherType2["X25519_SALSA_POLY_CIPHER_PASSWORD"] = "X25519_SALSA_POLY_CIPHER_PASSWORD";
  return CipherType2;
})(CipherType || {});
exports.CipherType = CipherType;