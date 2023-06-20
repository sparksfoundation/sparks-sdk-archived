"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _User = require("./User.cjs");
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