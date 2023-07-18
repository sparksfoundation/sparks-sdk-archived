"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreChannelActions = exports.ChannelType = void 0;
const ChannelType = {
  WebRTC: "WebRTC",
  PostMessage: "PostMessage",
  HttpFetch: "HttpFetch",
  HttpRest: "HttpRest"
};
exports.ChannelType = ChannelType;
const CoreChannelActions = ["OPEN", "CLOSE", "MESSAGE"];
exports.CoreChannelActions = CoreChannelActions;