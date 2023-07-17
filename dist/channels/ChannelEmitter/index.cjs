"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _ChannelEmitter = require("./ChannelEmitter.cjs");
Object.keys(_ChannelEmitter).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ChannelEmitter[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ChannelEmitter[key];
    }
  });
});