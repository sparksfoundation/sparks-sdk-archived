import { AgentAbstract } from "./agent/types";
import { CipherAbstract } from "./cipher/CipherAbstract";
import { EncryptedData, EncryptionKeyPair, EncryptionPublicKey, EncryptionSecretKey } from "./cipher/types";
import { ErrorInterface } from "./common/errors";
import { ControllerAbstract } from "./controller";
import { HasherAbstract } from "./hasher/HasherAbstract";
import { HashDigest } from "./hasher/types";
import { SignerAbstract } from "./signer/SignerAbstract";
import { SigningKeyPair, SigningPublicKey, SigningSecretKey } from "./signer/types";

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
  X extends CipherAbstract,
  C extends ControllerAbstract,
  H extends HasherAbstract,
  S extends SignerAbstract,
> = {
  agents?: Constructable<A[number]>[];
  cipher: Constructable<X>;
  controller: Constructable<C>;
  hasher: Constructable<H>;
  signer: Constructable<S>;
};

export interface SparkInterface<
  A extends AgentAbstract[],
  X extends CipherAbstract,
  C extends ControllerAbstract,
  H extends HasherAbstract,
  S extends SignerAbstract,
> {

  // spark
  publicKeys: PublicKeys | ErrorInterface;
  secretKeys: SecretKeys | ErrorInterface;
  keyPairs: KeyPairs | ErrorInterface;
  generateKeyPairs: (args: any) => Promise<KeyPairs | ErrorInterface>;
  setKeyPairs: (keyPairs: KeyPairs) => Promise<void | ErrorInterface>;
  import: (data: EncryptedData) => Promise<void | ErrorInterface>;
  export: () => Promise<HashDigest | ErrorInterface>;

  // agent
  agents?: { [key: string]: InstanceType<Constructable<A[number]>> };

  // cipher
  generateSharedEncryptionKey: X['generateSharedKey'];
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
  sign: S['sign'];
  seal: S['seal'];
  verify: S['verify'];
  open: S['open'];
}