import { Identity } from './Identity.js';

function CastingAgent(...mixins) {
  return mixins.reduce((base, mixin) => mixin(base), Identity);
}

export { CastingAgent as default };
