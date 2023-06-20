"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Agent = require("./Agent.cjs");
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