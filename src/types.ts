// TODO - promote error factories to class with type of extended class

import { AgentCore } from "./agents/AgentCore";
import { CipherCore } from "./ciphers/CipherCore";
import { CipherKeyPair, CipherPublicKey, CipherSecretKey } from "./ciphers/types";
import { ControllerCore } from "./controllers";
import { HasherCore } from "./hashers/HasherCore";
import { SignerCore } from "./signers/SignerCore";
import { SignedEncryptedData, SignerKeyPair, SignerPublicKey, SignerSecretKey } from "./signers/types";

// utils
export interface Constructable<T> {
  new(...args: any[]): T;
}

// spark
export interface KeyPairs {
  cipher: CipherKeyPair;
  signer: SignerKeyPair;
}

export interface PublicKeys {
  cipher: CipherPublicKey;
  signer: SignerPublicKey;
}

export interface SecretKeys {
  cipher: CipherSecretKey;
  signer: SignerSecretKey;
}

export type SparkParams<
  A extends AgentCore[],
  X extends CipherCore,
  C extends ControllerCore,
  H extends HasherCore,
  S extends SignerCore,
> = {
  agents?: Constructable<A[number]>[];
  cipher: Constructable<X>;
  controller: Constructable<C>;
  hasher: Constructable<H>;
  signer: Constructable<S>;
};

export interface SparkInterface<
  A extends AgentCore[],
  X extends CipherCore,
  C extends ControllerCore,
  H extends HasherCore,
  S extends SignerCore,
> {

  // spark
  publicKeys: PublicKeys;
  secretKeys: SecretKeys;
  keyPairs: KeyPairs;
  generateKeyPairs: (params?: Record<string, any>) => Promise<KeyPairs>;
  setKeyPairs: (params?: Record<string, any>) => void;
  import: (data: SignedEncryptedData) => Promise<void>;
  export: () => Promise<SignedEncryptedData>;

  // agent
  agents?: { [key: string]: InstanceType<Constructable<A[number]>> };

  // cipher
  generateCipherSharedKey: X['generateSharedKey'];
  setCipherKeyPair: X['setKeyPair'];
  encrypt: X['encrypt'];
  decrypt: X['decrypt'];

  // controller
  identifier: ReturnType<C['getIdentifier']>;
  keyEventLog: ReturnType<C['getKeyEventLog']>;
  incept: (params?: Record<string, any>) => Promise<void>;
  rotate: (params?: Record<string, any>) => Promise<void>;
  destroy: (params?: Record<string, any>) => Promise<void>;

  // hasher
  hash: H['hash'];

  // signer
  generateSignerKeyPair: S['generateKeyPair'];
  setSignerKeyPair: S['setKeyPair'];
  sign: S['sign'];
  seal: S['seal'];
  verify: S['verify'];
  open: S['open'];
}