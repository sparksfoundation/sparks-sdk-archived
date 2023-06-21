export var ChannelActions = /* @__PURE__ */ ((ChannelActions2) => {
  ChannelActions2["CONFIRM"] = "confirm";
  ChannelActions2["ACCEPT"] = "accept";
  ChannelActions2["REJECT"] = "reject";
  return ChannelActions2;
})(ChannelActions || {});
export var ChannelCallbackEvents = /* @__PURE__ */ ((ChannelCallbackEvents2) => {
  ChannelCallbackEvents2["OPEN"] = "open";
  ChannelCallbackEvents2["CLOSE"] = "close";
  ChannelCallbackEvents2["MESSAGE"] = "message";
  ChannelCallbackEvents2["ERROR"] = "error";
  return ChannelCallbackEvents2;
})(ChannelCallbackEvents || {});
export var ChannelTypes = /* @__PURE__ */ ((ChannelTypes2) => {
  ChannelTypes2["POST_MESSAGE"] = "post_message";
  ChannelTypes2["WEB_RTC"] = "web_rtc";
  ChannelTypes2["WEB_SOCKET"] = "web_socket";
  ChannelTypes2["BLUE_TOOTH"] = "blue_tooth";
  ChannelTypes2["NFC"] = "nfc";
  ChannelTypes2["QR_CODE"] = "qr_code";
  ChannelTypes2["REST_API"] = "rest_api";
  ChannelTypes2["FETCH_API"] = "fetch_api";
  return ChannelTypes2;
})(ChannelTypes || {});
export var ChannelEventTypes = /* @__PURE__ */ ((ChannelEventTypes2) => {
  ChannelEventTypes2["OPEN_REQUEST"] = "open_request";
  ChannelEventTypes2["OPEN_ACCEPT"] = "open_accept";
  ChannelEventTypes2["OPEN_CONFIRM"] = "open_confirm";
  ChannelEventTypes2["CLOSE_REQUEST"] = "close_request";
  ChannelEventTypes2["CLOSE_CONFIRM"] = "close_confirm";
  ChannelEventTypes2["MESSAGE_SEND"] = "message_send";
  ChannelEventTypes2["MESSAGE_CONFIRM"] = "message_confirm";
  return ChannelEventTypes2;
})(ChannelEventTypes || {});
export var ChannelEventConfirmTypes = /* @__PURE__ */ ((ChannelEventConfirmTypes2) => {
  ChannelEventConfirmTypes2["CLOSE_REQUEST"] = "close_request" /* CLOSE_REQUEST */;
  ChannelEventConfirmTypes2["MESSAGE_SEND"] = "message_send" /* MESSAGE_SEND */;
  return ChannelEventConfirmTypes2;
})(ChannelEventConfirmTypes || {});
export var ChannelErrorCodes = /* @__PURE__ */ ((ChannelErrorCodes2) => {
  ChannelErrorCodes2["OPEN_REQUEST_ERROR"] = "open_request_error";
  ChannelErrorCodes2["OPEN_ACCEPT_ERROR"] = "open_accept_error";
  ChannelErrorCodes2["OPEN_CONFIRM_ERROR"] = "open_confirm_error";
  ChannelErrorCodes2["TIMEOUT_ERROR"] = "timeout_error";
  ChannelErrorCodes2["CLOSE_REQUEST_ERROR"] = "close_request_error";
  ChannelErrorCodes2["CLOSE_CONFIRM_ERROR"] = "close_confirm_error";
  ChannelErrorCodes2["MESSAGE_SEND_ERROR"] = "message_send_error";
  ChannelErrorCodes2["MESSAGE_CONFIRM_ERROR"] = "message_confirm_error";
  return ChannelErrorCodes2;
})(ChannelErrorCodes || {});
