"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Profile = require("./Profile.cjs");
Object.keys(_Profile).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Profile[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Profile[key];
    }
  });
});