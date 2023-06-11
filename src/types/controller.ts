import { Backers, KeriEvents, KeriEventOptions } from "./events.js";
import { KeyPairs, PublicKeys } from "./keys.js";
import { MixinType } from "./mixins.js";
import { Hash } from "./hash.js";

export type Identifier = string; // base64 identifier

// Mixin: Controller is an abstract class that provides base agent functionality
export abstract class Controller implements Hash {
  static type = MixinType.CONTROLLER;
  protected identifier: Identifier;
  protected keyPairs: KeyPairs;
  protected keyEventLog: KeriEvents[];
  protected abstract get publicKeys(): PublicKeys | never;
  constructor(args) {}

  abstract incept(args: { keyPairs: KeyPairs, nextKeyPairs: KeyPairs, backers: Backers }): void | never;
  abstract rotate(args: { keyPairs: KeyPairs, nextKeyPairs: KeyPairs, backers: Backers }): void | never;
  abstract destroy(args?: { backers?: Backers }): void | never;
  protected abstract keyEvent(args: KeriEventOptions) : KeriEvents | never;
  
  hash(data: string | object): string {
    throw new Error('Missing mixing of type `hash`')
  }
  sign({ data, detached }: { data: string, detached: boolean }): string {
    throw new Error('Missing mixing of type `sign`')
  }
}