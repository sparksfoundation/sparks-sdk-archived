"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Random = require("./Random.cjs");
Object.keys(_Random).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Random[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Random[key];
    }
  });
});