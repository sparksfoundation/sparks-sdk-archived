import Identity from './Identity.js';

export default function CastingAgent({
  agents = [],
  encrypt = undefined,
  hash = undefined,
  sign = undefined,
  derive = undefined,
  channels = []
}: {
  agents?: Function[],
  encrypt?: Function,
  hash?: Function,
  sign?: Function,
  derive?: Function,
  channels?: Function[],
}) {

  const Mixins = [...agents, encrypt, hash, sign, derive, ...channels].filter((mixin) => !!mixin) as Function[];

  // get all the available types and mixin names
  const available = Mixins
    .map((mixin: any): { name: string, type: string } => {
      if (!mixin.type) throw new Error(`Missing type for ${mixin.name}`);
      return { name: mixin.name, type: mixin.type }
    })

  // check for duplicate names
  const names = available.map((mixin) => mixin.name);
  const hasDuplicates = names.some((name, index) => names.indexOf(name) !== index);
  if (hasDuplicates) {
    throw new Error(`Duplicate mixin found: ${names}`);
  }

  // go through the dependency tree and make sure all dependencies are available
  // if we hit a missing depenedency, throw an error
  Mixins.forEach((mixin: any) => {
    if (!mixin.dependencies) return;
    Object.keys(mixin.dependencies).forEach((dependency) => {
      // if the dependency is defined as a boolean check if the type is available
      if (typeof mixin.dependencies[dependency] === 'boolean') {
        const dependencyAvailable = available.some((mixin) => mixin.type === dependency);
        const dependencyList = available.filter((mixin) => mixin.type === dependency).map((mixin) => mixin.name);
        if (!dependencyAvailable) {
          const names = dependencyList.join(' | ');
          throw new Error(`${mixin.name} requires dependency: ${names}`);
        }
        return;
      } else {
        const dependencyList = Array.isArray(mixin.dependencies[dependency]) ? mixin.dependencies[dependency] : [mixin.dependencies[dependency]];
        const dependencyAvailable = dependencyList.some((dependency) => available.some((mixin) => mixin.name === dependency));
        if (!dependencyAvailable) {
          const names = dependencyList.length === 1 ? dependencyList[0] : `${dependencyList.join(' | ')}`;
          throw new Error(`${mixin.name} requires dependency: ${names}`);
        }
        return;
      }
    })
  })

  return Mixins.reduce((base, mixin) => mixin(base), Identity) as typeof Identity;
}
