"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Agent = void 0;
class Agent {
  // TODO define spark interface
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
}
exports.Agent = Agent;