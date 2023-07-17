"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebRTCActions = void 0;
var _types = require("../../types.cjs");
const WebRTCActions = [..._types.CoreChannelActions, "CALL", "HANGUP"];
exports.WebRTCActions = WebRTCActions;