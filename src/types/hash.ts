import { MixinType } from "./mixins.js";

// Mixin: Hash is an abstract class that provides a hash function
export abstract class Hash {
  static type = MixinType.HASH;
  abstract hash(data: string | object): string;
  constructor(args) {}
}