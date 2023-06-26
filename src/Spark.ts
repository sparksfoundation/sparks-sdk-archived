import { Controller } from "./controller";
import { Constructable, KeyPairs, PublicKeys, SecretKeys, SparkParams } from "./types";
import { AgentAbstract } from "./agent/types";
import { CipherAbstract, EncryptionKeyPair } from "./cipher/types";
import { HashDigest, HasherAbstract } from "./hasher/types";
import { SignerAbstract, SigningKeyPair } from "./signer/types";
import { SparkInterface } from "./types";
import { ControllerInterface } from "./controller/types";
import { SparkError, ErrorInterface } from "./common/errors";

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
    this.controller = new Controller(this);

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
    const encryption = this.encryptionKeyPair as EncryptionKeyPair;
    const signing = this.signingKeyPair as SigningKeyPair;
    if (encryption instanceof SparkError) return encryption as ErrorInterface;
    if (signing instanceof SparkError) return signing as ErrorInterface;
    return { encryption, signing } as KeyPairs;
  }

  get publicKeys(): PublicKeys | ErrorInterface {
    const encryption = this.encryptionKeyPair as EncryptionKeyPair;
    const signing = this.signingKeyPair as SigningKeyPair;
    if (encryption instanceof SparkError) return encryption as ErrorInterface;
    if (signing instanceof SparkError) return signing as ErrorInterface;
    return {
      encryption: encryption.publicKey,
      signing: signing.publicKey
    } as PublicKeys;
  }

  get secretKeys(): SecretKeys | ErrorInterface {
    const encryption = this.encryptionKeyPair as EncryptionKeyPair;
    const signing = this.signingKeyPair as SigningKeyPair;
    if (encryption instanceof SparkError) return encryption as ErrorInterface;
    if (signing instanceof SparkError) return signing as ErrorInterface;
    return {
      encryption: encryption.secretKey,
      signing: signing.secretKey
    }
  }

  async generateKeyPairs(args: any): Promise<KeyPairs | ErrorInterface> {
    const signingKeyPair = await this.signer.generateKeyPair(args);
    const encryptionKeyPair = await this.cipher.generateKeyPair(args);
    if (signingKeyPair instanceof SparkError) return signingKeyPair as ErrorInterface;
    if (encryptionKeyPair instanceof SparkError) return encryptionKeyPair as ErrorInterface;
    return { encryption: encryptionKeyPair, signing: signingKeyPair } as KeyPairs;
  }

  import(data: HashDigest): Promise<void | ErrorInterface> {
    return Promise.resolve();
  }

  export(): Promise<HashDigest> {
    return Promise.resolve('');
  }

  // cipher
  get encryptionKeyPair(): ReturnType<C['getKeyPair']> {
    return this.cipher.getKeyPair() as ReturnType<C['getKeyPair']>;
  }

  get encryptionPublicKey(): ReturnType<C['getPublicKey']> {
    return this.cipher.getPublicKey() as ReturnType<C['getPublicKey']>;
  }

  get encryptionSecretKey(): ReturnType<C['getSecretKey']> {
    return this.cipher.getSecretKey() as ReturnType<C['getSecretKey']>;
  }

  get generateEncryptionKeyPair(): C['generateKeyPair'] {
    return this.cipher.generateKeyPair;
  }

  get setEncryptionKeyPair(): C['setKeyPair'] {
    return this.cipher.setKeyPair;
  }

  get generateSharedEncryptionKey(): C['generateSharedKey'] {
    return this.cipher.generateSharedKey;
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
    return this.controller.getKeyEventLog();
  }

  get incept(): ControllerInterface['incept'] {
    return this.controller.incept;
  }

  get rotate(): ControllerInterface['rotate'] {
    return this.controller.rotate;
  }

  get destroy(): ControllerInterface['destroy'] {
    return this.controller.destroy;
  }

  // hasher
  get hash(): H['hash'] {
    return this.hasher.hash;
  }

  // signer
  get signingKeyPair(): ReturnType<S['getKeyPair']> {
    return this.signer.getKeyPair() as ReturnType<S['getKeyPair']>;
  }

  get signingPublicKey(): ReturnType<S['getPublicKey']> {
    return this.signer.getPublicKey() as ReturnType<S['getPublicKey']>;
  }

  get signingSecretKey(): ReturnType<S['getSecretKey']> {
    return this.signer.getSecretKey() as ReturnType<S['getSecretKey']>;
  }

  get generateSigningKeyPair(): S['generateKeyPair'] {
    return this.signer.generateKeyPair;
  }

  get setSigningKeyPair(): S['setKeyPair'] {
    return this.signer.setKeyPair;
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