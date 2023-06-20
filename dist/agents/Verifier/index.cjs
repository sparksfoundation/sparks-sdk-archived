"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Verifier = require("./Verifier.cjs");
Object.keys(_Verifier).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Verifier[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Verifier[key];
    }
  });
});