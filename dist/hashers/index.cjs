"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Hasher = require("./Hasher/index.cjs");
Object.keys(_Hasher).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Hasher[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Hasher[key];
    }
  });
});
var _Blake = require("./Blake3/index.cjs");
Object.keys(_Blake).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Blake[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Blake[key];
    }
  });
});