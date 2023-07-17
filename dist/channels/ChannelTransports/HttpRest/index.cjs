"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _HttpRest = require("./HttpRest.cjs");
Object.keys(_HttpRest).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _HttpRest[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _HttpRest[key];
    }
  });
});