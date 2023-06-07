import { Identity } from './Identity.js';

function Agent(...mixins) {
  return mixins.reduce((base, mixin) => mixin(base), Identity);
}

export { Agent as default };
