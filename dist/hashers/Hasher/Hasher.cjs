"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Hasher = void 0;
class Hasher {
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
  async hash(data) {
    return data;
  }
}
exports.Hasher = Hasher;