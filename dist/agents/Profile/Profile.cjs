"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Profile = void 0;
var _CoreAgent = require("../CoreAgent.cjs");
class Profile extends _CoreAgent.CoreAgent {
  async import(data) {
    this.avatar = data.avatar;
    this.handle = data.handle;
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({
      avatar: this.avatar,
      handle: this.handle
    });
  }
}
exports.Profile = Profile;