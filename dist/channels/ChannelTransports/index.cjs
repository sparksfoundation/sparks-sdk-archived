"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _PostMessage = require("./PostMessage/index.cjs");
Object.keys(_PostMessage).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _PostMessage[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _PostMessage[key];
    }
  });
});
var _HttpFetch = require("./HttpFetch/index.cjs");
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
var _HttpRest = require("./HttpRest/index.cjs");
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
var _WebRTC = require("./WebRTC/index.cjs");
Object.keys(_WebRTC).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _WebRTC[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _WebRTC[key];
    }
  });
});