"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Blake = require("./Blake3.cjs");
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