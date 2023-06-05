'use strict';

var Identity_js = require('./agents/Identity.js');
var index_js = require('./forge/index.js');
var PostMessage_js = require('./channels/PostMessage.js');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var index_js__namespace = /*#__PURE__*/_interopNamespace(index_js);



Object.defineProperty(exports, 'Identity', {
  enumerable: true,
  get: function () { return Identity_js.Identity; }
});
exports.forge = index_js__namespace;
Object.defineProperty(exports, 'PostMessage', {
  enumerable: true,
  get: function () { return PostMessage_js.PostMessage; }
});
