import { AgentAbstract } from "./agent/types";
import { CipherAbstract, EncryptedData, EncryptionKeyPair, EncryptionPublicKey, EncryptionSecretKey } from "./cipher/types";
import { ErrorInterface } from "./common/errors";
import { ControllerInterface, Identifier, KeyEventLog } from "./controller/types";
import { HashDigest, HasherAbstract } from "./hasher/types";
import { SignerAbstract, SigningKeyPair, SigningPublicKey, SigningSecretKey } from "./signer/types";

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
  C extends CipherAbstract,
  H extends HasherAbstract,
  S extends SignerAbstract
> = {
  agents?: Constructable<A[number]>[];
  cipher: Constructable<C>;
  hasher: Constructable<H>;
  signer: Constructable<S>;
};

export interface SparkInterface<
  A extends AgentAbstract[],
  C extends CipherAbstract,
  H extends HasherAbstract,
  S extends SignerAbstract,
> {

  // spark
  keyPairs: KeyPairs | ErrorInterface;
  publicKeys: PublicKeys | ErrorInterface;
  secretKeys: SecretKeys | ErrorInterface;
  generateKeyPairs: (args: any) => Promise<KeyPairs | ErrorInterface>;
  import: (data: EncryptedData) => Promise<void | ErrorInterface>;
  export: () => Promise<HashDigest | ErrorInterface>;

  // agent
  agents?: { [key: string]: InstanceType<Constructable<A[number]>> };

  // cipher
  encryptionKeyPair: ReturnType<C['getKeyPair']>;
  encryptionPublicKey: ReturnType<C['getPublicKey']>;
  encryptionSecretKey: ReturnType<C['getSecretKey']>;
  generateEncryptionKeyPair: C['generateKeyPair'];
  setEncryptionKeyPair: C['setKeyPair'];
  generateSharedEncryptionKey: C['generateSharedKey'];
  encrypt: C['encrypt'];
  decrypt: C['decrypt'];

  // controller
  identifier: ReturnType<ControllerInterface['getIdentifier']>;
  keyEventLog: ReturnType<ControllerInterface['getKeyEventLog']>;
  incept: ControllerInterface['incept'];
  rotate: ControllerInterface['rotate'];
  destroy: ControllerInterface['destroy'];

  // hasher
  hash: H['hash'];

  // signer
  signingKeyPair: ReturnType<S['getKeyPair']>;
  signingPublicKey: ReturnType<S['getPublicKey']>;
  signingSecretKey: ReturnType<S['getSecretKey']>;
  generateSigningKeyPair: S['generateKeyPair'];
  setSigningKeyPair: S['setKeyPair'];
  sign: S['sign'];
  seal: S['seal'];
  verify: S['verify'];
  open: S['open'];
}