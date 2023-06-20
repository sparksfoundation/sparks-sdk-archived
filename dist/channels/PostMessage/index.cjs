"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _PostMessage = require("./PostMessage.cjs");
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