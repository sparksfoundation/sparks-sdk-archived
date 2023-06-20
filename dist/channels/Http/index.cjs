"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _FetchAPI = require("./FetchAPI.cjs");
Object.keys(_FetchAPI).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _FetchAPI[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _FetchAPI[key];
    }
  });
});
var _RestAPI = require("./RestAPI.cjs");
Object.keys(_RestAPI).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _RestAPI[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _RestAPI[key];
    }
  });
});