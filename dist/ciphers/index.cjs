"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _X25519SalsaPoly = require("./X25519SalsaPoly/index.cjs");
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