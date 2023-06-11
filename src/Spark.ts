import { Agent, Channel, Controller, Derive, Encrypt, Hash, MixinType, Sign } from "./types/index.js";

interface Constructor<T> {
  new(...args: any[]): T;
  type: MixinType;
}

function mixin<TBase, TMixin>(base: TBase, mixin: TMixin): TBase & TMixin {
  const derivedCtor = base as any;
  const baseCtor = mixin as any;

  Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
    Object.defineProperty(
      derivedCtor.prototype,
      name,
      Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
      Object.create(null)
    );
  });
  return derivedCtor as TBase & TMixin;
}

export function Spark({
  controller = undefined,
  agents = [],
  derive = undefined,
  sign = undefined,
  hash = undefined,
  encrypt = undefined,
  storage = undefined,
  channels = [],
}: {
  controller?: Constructor<Controller>,
  agents?: Constructor<Agent>[],
  derive?: Constructor<Derive>,
  sign?: Constructor<Sign>,
  hash?: Constructor<Hash>,
  encrypt?: Constructor<Encrypt>,
  storage?: Constructor<Storage>,
  channels?: Constructor<Channel>[],
}) {
  const allProps = [controller, ...agents, derive, encrypt, hash, sign, storage, ...channels]
  const allMixins = allProps.filter((c): c is Constructor<any> => c !== undefined);
  const Clazz = allMixins.reduce((acc, curr) => mixin(acc, curr), Agent as any);
  return Clazz as Constructor<any> & typeof allMixins[number];
}
