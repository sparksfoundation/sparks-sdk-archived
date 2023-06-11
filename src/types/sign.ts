import { SigningPublicKey } from "./keys.js";
import { MixinType } from "./mixins.js";

// Mixin: Sign is an abstract class that provides signing and verification
export abstract class Sign {
  static type = MixinType.SIGN;
  abstract sign(args: { data: string | object, detached: boolean }): string | null;
  abstract verify(args: { data: string | object, signature: string, publicKey: SigningPublicKey }): void;
}
