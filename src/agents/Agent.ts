import { Identity } from './Identity.js';

export default function Agent(...mixins) {

  return mixins.reduce((base, mixin) => mixin(base), Identity);
}
