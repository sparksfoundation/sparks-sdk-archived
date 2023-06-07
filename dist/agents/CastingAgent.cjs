'use strict';

var Identity_js = require('./Identity.js');

function CastingAgent(...mixins) {
  return mixins.reduce((base, mixin) => mixin(base), Identity_js.Identity);
}

module.exports = CastingAgent;
