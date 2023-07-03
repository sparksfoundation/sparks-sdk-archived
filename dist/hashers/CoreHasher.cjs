"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreHasher = void 0;
class CoreHasher {
  constructor() {
    this.hash = this.hash.bind(this);
  }
  async import(data) {
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({});
  }
}
exports.CoreHasher = CoreHasher;