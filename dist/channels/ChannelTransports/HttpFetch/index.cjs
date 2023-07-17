"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _HttpFetch = require("./HttpFetch.cjs");
Object.keys(_HttpFetch).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _HttpFetch[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _HttpFetch[key];
    }
  });
});