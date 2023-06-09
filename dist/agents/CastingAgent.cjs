'use strict';

var Identity = require('./Identity.js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Identity__default = /*#__PURE__*/_interopDefault(Identity);

function CastingAgent({
  agents = [],
  encrypt = void 0,
  hash = void 0,
  sign = void 0,
  derive = void 0,
  channels = []
}) {
  const Mixins = [...agents, encrypt, hash, sign, derive, ...channels].filter((mixin) => !!mixin);
  const available = Mixins.map((mixin) => {
    if (!mixin.type)
      throw new Error(`Missing type for ${mixin.name}`);
    return { name: mixin.name, type: mixin.type };
  });
  const names = available.map((mixin) => mixin.name);
  const hasDuplicates = names.some((name, index) => names.indexOf(name) !== index);
  if (hasDuplicates) {
    throw new Error(`Duplicate mixin found: ${names}`);
  }
  Mixins.forEach((mixin) => {
    if (!mixin.dependencies)
      return;
    Object.keys(mixin.dependencies).forEach((dependency) => {
      if (typeof mixin.dependencies[dependency] === "boolean") {
        const dependencyAvailable = available.some((mixin2) => mixin2.type === dependency);
        const dependencyList = available.filter((mixin2) => mixin2.type === dependency).map((mixin2) => mixin2.name);
        if (!dependencyAvailable) {
          const names2 = dependencyList.join(" | ");
          throw new Error(`${mixin.name} requires dependency: ${names2}`);
        }
        return;
      } else {
        const dependencyList = Array.isArray(mixin.dependencies[dependency]) ? mixin.dependencies[dependency] : [mixin.dependencies[dependency]];
        const dependencyAvailable = dependencyList.some((dependency2) => available.some((mixin2) => mixin2.name === dependency2));
        if (!dependencyAvailable) {
          const names2 = dependencyList.length === 1 ? dependencyList[0] : `${dependencyList.join(" | ")}`;
          throw new Error(`${mixin.name} requires dependency: ${names2}`);
        }
        return;
      }
    });
  });
  return Mixins.reduce((base, mixin) => mixin(base), Identity__default.default);
}

module.exports = CastingAgent;
