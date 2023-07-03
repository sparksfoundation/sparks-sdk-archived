"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _CoreAgent = require("./CoreAgent.cjs");
Object.keys(_CoreAgent).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _CoreAgent[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _CoreAgent[key];
    }
  });
});