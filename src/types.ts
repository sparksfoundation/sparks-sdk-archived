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

  // spark
  keyPairs: KeyPairs | ErrorInterface;
  publicKeys: PublicKeys | ErrorInterface;
  secretKeys: SecretKeys | ErrorInterface;
  import: (data: EncryptedData) => Promise<void | ErrorInterface>;
  export: () => Promise<HashDigest | ErrorInterface>;

  // agent
  agents?: { [key: string]: InstanceType<Constructable<A[number]>> };

  // cipher
  encryptionKeys: ReturnType<C['getKeyPair']>;
  publicEncryptionKey: ReturnType<C['getPublicKey']>;
  secretEncryptionKey: ReturnType<C['getSecretKey']>;
  initEncryptionKeys: C['initKeyPair'];
  nextEncryptionKeys: C['getNextKeyPair'];
  computSharedEncryptionKey: C['computeSharedKey'];
  encrypt: C['encrypt'];
  decrypt: C['decrypt'];

  // controller
  identifier: ControllerInterface['identifier'];
  keyEventLog: ControllerInterface['keyEventLog'];
  incept: ControllerInterface['incept'];
  rotate: ControllerInterface['rotate'];
  destroy: ControllerInterface['destroy'];

  // hasher
  hash: H['hash'];

  // signer
  signingKeys: ReturnType<S['getKeyPair']>;
  publicSigningKey: ReturnType<S['getPublicKey']>;
  secretSigningKey: ReturnType<S['getSecretKey']>;
  initSingingKeys: S['initKeyPair'];
  nextSigningKeys: S['getNextKeyPair'];
  sign: S['sign'];
  seal: S['seal'];
  verify: S['verify'];
  open: S['open'];
}