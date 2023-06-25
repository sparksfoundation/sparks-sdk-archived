import { AgentAbstract } from "./agents/types";
import { CipherAbstract, EncryptedData, EncryptionKeyPair, EncryptionPublicKey, EncryptionSecretKey } from "./ciphers/types";
import { ErrorInterface } from "./common/errors";
import { ControllerInterface, Identifier, KeyEventLog } from "./controller/types";
import { HashDigest, HasherAbstract } from "./hashers/types";
import { SignerAbstract, SigningKeyPair, SigningPublicKey, SigningSecretKey } from "./signers/types";

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

  agents?: { [key: string]: InstanceType<Constructable<A[number]>> };

  keyPairs: KeyPairs | ErrorInterface;
  publicKeys: PublicKeys | ErrorInterface;
  secretKeys: SecretKeys | ErrorInterface;

  getIdentifier: ControllerInterface['getIdentifier'];
  getKeyEventLog: ControllerInterface['getKeyEventLog'];

  encryptionKeys: C['getKeyPair'];
  signingKeys: S['getKeyPair'];

  initEncryptionKeys: C['initKeyPair'];
  computSharedEncryptionKey: C['computeSharedKey'];
  encrypt: C['encrypt'];
  decrypt: C['decrypt'];

  hash: H['hash'];

  initSingingKeys: S['initKeyPair'];
  sign: S['sign'];
  seal: S['seal'];
  verify: S['verify'];
  open: S['open'];

  incept: ControllerInterface['incept'];
  rotate: ControllerInterface['rotate'];
  destroy: ControllerInterface['destroy'];

  import: (data: EncryptedData) => Promise<void | ErrorInterface>;
  export: () => Promise<HashDigest | ErrorInterface>;
}