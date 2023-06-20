"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Channel = require("./Channel/index.cjs");
Object.keys(_Channel).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Channel[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Channel[key];
    }
  });
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
var _Http = require("./Http/index.cjs");
Object.keys(_Http).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Http[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Http[key];
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