import { Identity } from './Identity.js';

export default function CastingAgent(...mixins) {

  return mixins.reduce((base, mixin) => mixin(base), Identity);
}
