import { EncryptionPublicKey, EncryptionSharedKey } from "./keys.js";
import { MixinType } from "./mixins.js";

// Mixin: Encrypt is an abstract class that provides encryption and decryption
export abstract class Encrypt {
  static type = MixinType.ENCRYPT
  abstract encrypt(args: { data: string | object, publicKey?: EncryptionPublicKey, sharedKey?: EncryptionSharedKey }): string | null;
  abstract decrypt(args: { data: string, publicKey?: EncryptionPublicKey, sharedKey?: EncryptionSharedKey }): string | null;
}

