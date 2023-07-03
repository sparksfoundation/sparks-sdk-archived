"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _X25519SalsaPoly = require("./X25519SalsaPoly.cjs");
Object.keys(_X25519SalsaPoly).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _X25519SalsaPoly[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _X25519SalsaPoly[key];
    }
  });
});
var _X25519SalsaPolyPassword = require("./X25519SalsaPolyPassword.cjs");
Object.keys(_X25519SalsaPolyPassword).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _X25519SalsaPolyPassword[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _X25519SalsaPolyPassword[key];
    }
  });
});