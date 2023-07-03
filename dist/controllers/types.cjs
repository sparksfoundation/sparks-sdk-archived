"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyEventType = exports.ControllerType = void 0;
var ControllerType = /* @__PURE__ */(ControllerType2 => {
  ControllerType2["CORE_CONTROLLER"] = "CORE_CONTROLLER";
  ControllerType2["BASIC_CONTROLLER"] = "BASIC_CONTROLLER";
  return ControllerType2;
})(ControllerType || {});
exports.ControllerType = ControllerType;
var KeyEventType = /* @__PURE__ */(KeyEventType2 => {
  KeyEventType2["INCEPT"] = "INCEPT";
  KeyEventType2["ROTATE"] = "ROTATE";
  KeyEventType2["DESTROY"] = "DESTROY";
  return KeyEventType2;
})(KeyEventType || {});
exports.KeyEventType = KeyEventType;