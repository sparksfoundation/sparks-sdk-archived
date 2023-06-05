'use strict';

var password_js = require('./password.js');
var random_js = require('./random.js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var password_js__default = /*#__PURE__*/_interopDefault(password_js);
var random_js__default = /*#__PURE__*/_interopDefault(random_js);



Object.defineProperty(exports, 'password', {
  enumerable: true,
  get: function () { return password_js__default.default; }
});
Object.defineProperty(exports, 'random', {
  enumerable: true,
  get: function () { return random_js__default.default; }
});
