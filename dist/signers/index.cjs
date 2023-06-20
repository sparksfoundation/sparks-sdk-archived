"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Signer = require("./Signer/index.cjs");
Object.keys(_Signer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Signer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Signer[key];
    }
  });
});
var _Ed = require("./Ed25519/index.cjs");
Object.keys(_Ed).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Ed[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Ed[key];
    }
  });
});