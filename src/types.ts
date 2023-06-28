// TODO - promote error factories to class with type of extended class

import { AgentCore } from "./agents/AgentCore";
import { CipherCore } from "./ciphers/CipherCore";
import { EncryptionKeyPair, EncryptionPublicKey, EncryptionSecretKey } from "./ciphers/types";
import { ControllerCore } from "./controllers";
import { HasherCore } from "./hashers/HasherCore";
import { SignerCore } from "./signers/SignerCore";
import { SignedEncryptedData, SigningKeyPair, SigningPublicKey, SigningSecretKey } from "./signers/types";

// utils
export interface Constructable<T> {
  new(...args: any[]): T;
}

// spark
export interface KeyPairs {
  encryption: EncryptionKeyPair;
  signing: SigningKeyPair;
}

export interface PublicKeys {
  encryption: EncryptionPublicKey;
  signing: SigningPublicKey;
}

export interface SecretKeys {
  encryption: EncryptionSecretKey;
  signing: SigningSecretKey;
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
  generateSharedEncryptionKey: X['generateSharedKey'];
  setEncryptionKeyPair: X['setKeyPair'];
  encrypt: X['encrypt'];
  decrypt: X['decrypt'];

  // controller
  identifier: ReturnType<C['getIdentifier']>;
  keyEventLog: ReturnType<C['getKeyEventLog']>;
  incept: C['incept'];
  rotate: C['rotate'];
  destroy: C['destroy'];

  // hasher
  hash: H['hash'];

  // signer
  generateSingingKeyPair: S['generateKeyPair'];
  setSigningKeyPair: S['setKeyPair'];
  sign: S['sign'];
  seal: S['seal'];
  verify: S['verify'];
  open: S['open'];
}