import { KeyPairs } from "./keys.js";
import { MixinType } from "./mixins.js";

// Mixin: Storage is an abstract class that serializes and deserializes data
export abstract class Storage {
  static type = MixinType.STORAGE;
  abstract import(args: { keyPairs: KeyPairs, data: string }): void | never;
  abstract export(): string | never;
}