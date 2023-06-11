import { Backers } from "./events.js";
import { MixinType } from "./mixins.js";

// Mixin: Derive is an abstract class that overloads methods that require keyPairs
// it provides custom ways to derive keyPairs needed for the parent implementations
export abstract class Derive {
  static type = MixinType.DERIVE;
  abstract incept(args: { [key: string]: any, backers: Backers }): void | never;
  abstract rotate(args: { [key: string]: any, backers: Backers }): void | never;
  abstract import(args: { [key: string]: any, data: string }): void | never;
}