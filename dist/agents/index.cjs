'use strict';

var Identity_js = require('./Identity.js');
var Verifier_js = require('./Verifier.js');
var Attester_js = require('./Attester.js');



Object.defineProperty(exports, 'Identity', {
  enumerable: true,
  get: function () { return Identity_js.Identity; }
});
Object.defineProperty(exports, 'Verifier', {
  enumerable: true,
  get: function () { return Verifier_js.Verifier; }
});
Object.defineProperty(exports, 'Attester', {
  enumerable: true,
  get: function () { return Attester_js.Attester; }
});
