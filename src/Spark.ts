import { Controller } from "./controller";
import { Constructable, KeyPairs, PublicKeys, SecretKeys, SparkParams } from "./types";
import { AgentAbstract } from "./agent/types";
import { CipherAbstract, EncryptionKeyPair } from "./cipher/types";
import { HashDigest, HasherAbstract } from "./hasher/types";
import { SignerAbstract, SigningKeyPair } from "./signer/types";
import { SparkInterface } from "./types";
import { ControllerErrorType, ControllerInterface, Identifier, KeyEventLog } from "./controller/types";
import { SparkError, ErrorInterface, ErrorMessage } from "./common/errors";
import { KeyEventType } from "./controller/types";

export class Spark<
  A extends AgentAbstract[],
  C extends CipherAbstract,
  H extends HasherAbstract,
  S extends SignerAbstract
> implements SparkInterface<A, C, H, S> {

  private cipher: C;
  private hasher: H;
  private signer: S;
  public agents: { [key: string]: InstanceType<Constructable<A[number]>> } = {};
  private controller: ControllerInterface;

  constructor({
    agents = [],
    cipher,
    hasher,
    signer
  }: SparkParams<A, C, H, S>) {

    this.cipher = new cipher();
    this.hasher = new hasher();
    this.signer = new signer();
    this.controller = new Controller<H, S>({ 
      hasher: this.hasher, 
      signer: this.signer,
    });

    agents.forEach((agent: Constructable<A[number]>) => {
      const mixin = new agent();
      const name = agent.name.charAt(0).toLowerCase() + agent.name.slice(1);
      this.agents[name] = mixin;
    });

    Object.defineProperties(this, {
      agents: { enumerable: false, writable: false },
      cipher: { enumerable: false, writable: false },
      hasher: { enumerable: false, writable: false },
      signer: { enumerable: false, writable: false },
      controller: { enumerable: false, writable: false },
    });
  }

  // spark
  get keyPairs(): KeyPairs | ErrorInterface {
    const encryption = this.encryptionKeys as EncryptionKeyPair;
    const signing = this.signingKeys as SigningKeyPair;
    if (encryption instanceof SparkError) return encryption as ErrorInterface;
    if (signing instanceof SparkError) return signing as ErrorInterface;
    return { encryption, signing } as KeyPairs;
  }

  get publicKeys(): PublicKeys | ErrorInterface {
    const encryption = this.encryptionKeys as EncryptionKeyPair;
    const signing = this.signingKeys as SigningKeyPair;
    if (encryption instanceof SparkError) return encryption as ErrorInterface;
    if (signing instanceof SparkError) return signing as ErrorInterface;
    return {
      encryption: encryption.publicKey,
      signing: signing.publicKey
    } as PublicKeys;
  }

  get secretKeys(): SecretKeys | ErrorInterface {
    const encryption = this.encryptionKeys as EncryptionKeyPair;
    const signing = this.signingKeys as SigningKeyPair;
    if (encryption instanceof SparkError) return encryption as ErrorInterface;
    if (signing instanceof SparkError) return signing as ErrorInterface;
    return {
      encryption: encryption.secretKey,
      signing: signing.secretKey
    }
  }

  import(data: HashDigest): Promise<void | ErrorInterface> {
    return Promise.resolve();
  }

  export(): Promise<HashDigest> {
    return Promise.resolve('');
  }

  // cipher
  get encryptionKeys(): ReturnType<C['getKeyPair']> {
    return this.cipher.getKeyPair() as ReturnType<C['getKeyPair']>;
  }

  get publicEncryptionKey(): ReturnType<C['getPublicKey']> {
    return this.cipher.getPublicKey() as ReturnType<C['getPublicKey']>;
  }

  get secretEncryptionKey(): ReturnType<C['getSecretKey']> {
    return this.cipher.getSecretKey() as ReturnType<C['getSecretKey']>;
  }
  
  get initEncryptionKeys(): C['initKeyPair'] {
    return this.cipher.initKeyPair;
  }

  get computSharedEncryptionKey(): C['computeSharedKey'] {
    return this.cipher.computeSharedKey;
  }

  get nextEncryptionKeys(): C['getNextKeyPair'] {
    return this.cipher.getNextKeyPair;
  }

  get encrypt(): C['encrypt'] {
    return this.cipher.encrypt;
  }

  get decrypt(): C['decrypt'] {
    return this.cipher.decrypt;
  }

  // controller
  get identifier(): ReturnType<ControllerInterface['getIdentifier']> {
    return this.controller.getIdentifier();
  }

  get keyEventLog(): ReturnType<ControllerInterface['getKeyEventLog']> {
    console.log('hey', this.controller.getKeyEventLog())
    return this.controller.getKeyEventLog();
  }

  async incept(args: any): ReturnType<ControllerInterface['incept']> {
    try {
      const keyPairs = this.keyPairs as KeyPairs;
      if (keyPairs instanceof SparkError) throw keyPairs;

      const nextEncryptionKeys = await this.nextEncryptionKeys(args);
      if (nextEncryptionKeys instanceof SparkError) throw nextEncryptionKeys;

      const nextSigningKeys = await this.nextSigningKeys(args);
      if (nextSigningKeys instanceof SparkError) throw nextSigningKeys;

      const backers = args?.backers || [];
      const nextKeyPairs = {
        encryption: nextEncryptionKeys,
        signing: nextSigningKeys
      } as KeyPairs;

      const result = await this.controller.incept({
        keyPairs,
        nextKeyPairs,
        backers
      });

      if (result instanceof SparkError) throw result;
    } catch (error) {
      if (error instanceof SparkError) return error;
      return new SparkError({
        type: ControllerErrorType.INCEPT_FAILED,
        message: error.message as ErrorMessage,
      });
    }
  }

  async rotate(): ReturnType<ControllerInterface['rotate']> {
  }

  async destroy(): ReturnType<ControllerInterface['destroy']> {
  }

  // hasher
  get hash(): H['hash'] {
    return this.hasher.hash;
  }

  // signer
  get signingKeys(): ReturnType<S['getKeyPair']> {
    return this.signer.getKeyPair() as ReturnType<S['getKeyPair']>;
  }

  get publicSigningKey(): ReturnType<S['getPublicKey']> {
    return this.signer.getPublicKey() as ReturnType<S['getPublicKey']>;
  }

  get secretSigningKey(): ReturnType<S['getSecretKey']> {
    return this.signer.getSecretKey() as ReturnType<S['getSecretKey']>;
  }

  get initSingingKeys(): S['initKeyPair'] {
    return this.signer.initKeyPair;
  }

  get nextSigningKeys(): S['getNextKeyPair'] {
    return this.signer.getNextKeyPair;
  }

  get sign(): S['sign'] {
    return this.signer.sign;
  }

  get seal(): S['seal'] {
    return this.signer.seal;
  }

  get verify(): S['verify'] {
    return this.signer.verify;
  }

  get open(): S['open'] {
    return this.signer.open;
  }
}