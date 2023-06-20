"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Attester = require("./Attester.cjs");
Object.keys(_Attester).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Attester[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Attester[key];
    }
  });
});