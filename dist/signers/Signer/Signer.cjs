"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Signer = void 0;
class Signer {
  constructor(spark) {
    if (!spark) throw new Error("Channel: missing spark");
    this.spark = spark;
    Object.defineProperties(this, {
      spark: {
        enumerable: false,
        writable: false
      }
    });
  }
  async sign({
    data,
    detached = false
  }) {
    throw new Error("sign not implemented");
    return "";
  }
  async verify({
    publicKey,
    signature,
    data
  }) {
    throw new Error("verify not implemented");
    return false;
  }
}
exports.Signer = Signer;