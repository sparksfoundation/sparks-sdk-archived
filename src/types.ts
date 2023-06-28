// TODO - promote error factories to class with type of extended class

import { AgentAbstract } from "./agents/types";
import { CipherCore } from "./ciphers/CipherCore";
import { EncryptedData, EncryptionKeyPair, EncryptionPublicKey, EncryptionSecretKey } from "./ciphers/types";
import { ErrorInterface } from "./utilities/errors";
import { ControllerCore } from "./controllers";
import { HasherCore } from "./hashers/HasherCore";
import { HashDigest } from "./hashers/types";
import { SignerCore } from "./signers/SignerCore";
import { SigningKeyPair, SigningPublicKey, SigningSecretKey } from "./signers/types";

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
  A extends AgentAbstract[],
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
  A extends AgentAbstract[],
  X extends CipherCore,
  C extends ControllerCore,
  H extends HasherCore,
  S extends SignerCore,
> {

  // spark
  publicKeys: PublicKeys | ErrorInterface;
  secretKeys: SecretKeys | ErrorInterface;
  keyPairs: KeyPairs | ErrorInterface;
  generateKeyPairs: (params?: Record<string, any>) => Promise<KeyPairs | ErrorInterface>;
  setKeyPairs: ({ keyPairs }: { keyPairs: KeyPairs }) => void | ErrorInterface;
  import: (data: EncryptedData) => Promise<void | ErrorInterface>;
  export: () => Promise<HashDigest | ErrorInterface>;

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