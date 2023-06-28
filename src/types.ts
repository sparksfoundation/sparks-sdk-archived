// TODO - promote error factories to class with type of extended class

import { AgentCore } from "./agents/AgentCore";
import { CipherCore } from "./ciphers/CipherCore";
import { CipherKeyPair, CipherPublicKey, CipherSecretKey } from "./ciphers/types";
import { ControllerCore } from "./controllers";
import { HasherCore } from "./hashers/HasherCore";
import { SignerCore } from "./signers/SignerCore";
import { SignedEncryptedData, SignerKeyPair, SignerPublicKey, SignerSecretKey } from "./signers/types";
import { Constructable, UnwrapPromise } from "./utilities/types";

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

export type SparkImportAgentParam<A extends AgentCore[]> = {
  [K in keyof A]: Parameters<A[K]['import']>[0];
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

  generateKeyPairs: (params?: {
    cipher: Parameters<X['generateKeyPair']>[0],
    signer: Parameters<S['generateKeyPair']>[0],
  }) => Promise<{
    cipher: UnwrapPromise<ReturnType<X['generateKeyPair']>>,
    signer: UnwrapPromise<ReturnType<S['generateKeyPair']>>,
  }>;

  setKeyPairs: (params?: {
    cipher: Parameters<X['setKeyPair']>[0],
    signer: Parameters<S['setKeyPair']>[0],
  }) => void;

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
  
  keyEventLog: C['getKeyEventLog'];
  incept: (params?: {
    cipher: Parameters<X['generateKeyPair']>[0],
    signer: Parameters<S['generateKeyPair']>[0],
  }) => Promise<void>;

  rotate: (params?: {
    cipher: Parameters<X['generateKeyPair']>[0],
    signer: Parameters<S['generateKeyPair']>[0],
  }) => Promise<void>;

  destroy: (params?: {
    cipher: Parameters<X['generateKeyPair']>[0],
    signer: Parameters<S['generateKeyPair']>[0],
  }) => Promise<void>;

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