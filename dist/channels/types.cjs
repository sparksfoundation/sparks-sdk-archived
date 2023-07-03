"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChannelType = exports.ChannelState = exports.ChannelReceiptType = exports.ChannelEventType = void 0;
var ChannelState = /* @__PURE__ */(ChannelState2 => {
  ChannelState2["PENDING"] = "PENDING";
  ChannelState2["OPENED"] = "OPENED";
  ChannelState2["CLOSED"] = "CLOSED";
  return ChannelState2;
})(ChannelState || {});
exports.ChannelState = ChannelState;
var ChannelType = /* @__PURE__ */(ChannelType2 => {
  ChannelType2["CORE_CHANNEL"] = "CORE_CHANNEL";
  ChannelType2["POSTMESSAGE_CHANNEL"] = "POSTMESSAGE_CHANNEL";
  ChannelType2["WEBSOCKET_CHANNEL"] = "WEBSOCKET_CHANNEL";
  ChannelType2["WEBRTC_CHANNEL"] = "WEBRTC_CHANNEL";
  ChannelType2["REST_API_CHANNEL"] = "REST_API_CHANNEL";
  ChannelType2["FETCH_API_CHANNEL"] = "FETCH_API_CHANNEL";
  return ChannelType2;
})(ChannelType || {});
exports.ChannelType = ChannelType;
var ChannelEventType = /* @__PURE__ */(ChannelEventType2 => {
  ChannelEventType2["OPEN_REQUEST"] = "OPEN_REQUEST";
  ChannelEventType2["OPEN_ACCEPTANCE"] = "OPEN_ACCEPTANCE";
  ChannelEventType2["OPEN_CONFIRMATION"] = "OPEN_CONFIRMATION";
  ChannelEventType2["OPEN_REJECTION"] = "OPEN_REJECTION";
  ChannelEventType2["CLOSE"] = "CLOSE";
  ChannelEventType2["CLOSE_CONFIRMATION"] = "CLOSE_CONFIRMATION";
  ChannelEventType2["MESSAGE"] = "MESSAGE";
  ChannelEventType2["MESSAGE_CONFIRMATION"] = "MESSAGE_CONFIRMATION";
  ChannelEventType2["ERROR"] = "ERROR";
  return ChannelEventType2;
})(ChannelEventType || {});
exports.ChannelEventType = ChannelEventType;
var ChannelReceiptType = /* @__PURE__ */(ChannelReceiptType2 => {
  ChannelReceiptType2["OPEN_ACCEPTED"] = "OPEN_ACCEPTED";
  ChannelReceiptType2["OPEN_CONFIRMED"] = "OPEN_CONFIRMED";
  ChannelReceiptType2["CLOSE_CONFIRMED"] = "CLOSE_CONFIRMED";
  ChannelReceiptType2["MESSAGE_RECEIVED"] = "MESSAGE_RECEIVED";
  return ChannelReceiptType2;
})(ChannelReceiptType || {});
exports.ChannelReceiptType = ChannelReceiptType;