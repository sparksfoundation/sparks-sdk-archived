"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Agent = require("./Agent/index.cjs");
Object.keys(_Agent).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Agent[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Agent[key];
    }
  });
});
var _Verifier = require("./Verifier/index.cjs");
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
var _Attester = require("./Attester/index.cjs");
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
var _User = require("./User/index.cjs");
Object.keys(_User).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _User[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _User[key];
    }
  });
});