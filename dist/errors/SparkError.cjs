"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SparkError = void 0;
var _utilities = require("../utilities/index.cjs");
class SparkError {
  constructor(error) {
    const {
      name,
      message = "",
      metadata = {},
      stack
    } = error;
    this.name = name;
    this.message = message;
    this.timestamp = (0, _utilities.utcEpochTimestamp)();
    this.metadata = {
      ...metadata
    };
    this.stack = stack;
    Object.defineProperties(this, {
      stack: {
        enumerable: true
      }
    });
  }
}
exports.SparkError = SparkError;