"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Ed = require("./Ed25519.cjs");
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