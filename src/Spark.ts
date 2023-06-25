import { AgentTypes, CipherTypes, ControllerTypes, ErrorTypes, HasherTypes, SignerTypes, SparkTypes } from "./types";
import { SparkError } from "./errors";
import { Constructable } from "./types/utilities";
import { Controller } from "./controller";

export class Spark<
  A extends AgentTypes.AgentAbstract[],
  C extends CipherTypes.CipherAbstract,
  H extends HasherTypes.HasherAbstract,
  S extends SignerTypes.SignerAbstract
> implements SparkTypes.SparkInterface<A, C, H, S> {

  private cipher: C;
  private hasher: H;
  private signer: S;
  public agents: { [key: string]: InstanceType<Constructable<A[number]>> } = {};
  private controller: ControllerTypes.ControllerInterface;

  constructor({
    agents = [],
    cipher,
    hasher,
    signer
  }: SparkTypes.SparkParams<A, C, H, S>) {

    this.cipher = new cipher();
    this.controller = new Controller();
    this.hasher = new hasher();
    this.signer = new signer();

    agents.forEach((agent: Constructable<A[number]>) => {
      const mixin = new agent();
      const name = agent.name.charAt(0).toLowerCase() + agent.name.slice(1);
      this.agents[name] = mixin;
    });
  }

  get identifier(): ControllerTypes.Identifier | ErrorTypes.ErrorInterface {
    return this.controller.identifier;
  }

  get keyEventLog(): ControllerTypes.KeyEventLog | ErrorTypes.ErrorInterface {
    return this.controller.keyEventLog;
  }

  get keyPairs(): SparkTypes.KeyPairs | ErrorTypes.ErrorInterface {
    const encryption = this.encryptionKeys() as CipherTypes.KeyPair;
    const signing = this.signingKeys() as SignerTypes.KeyPair;
    if (encryption instanceof SparkError) return encryption as ErrorTypes.ErrorInterface;
    if (signing instanceof SparkError) return signing as ErrorTypes.ErrorInterface;
    return { encryption, signing } as SparkTypes.KeyPairs;
  }

  get publicKeys(): SparkTypes.PublicKeys | ErrorTypes.ErrorInterface {
    const encryption = this.encryptionKeys() as CipherTypes.KeyPair;
    const signing = this.signingKeys() as SignerTypes.KeyPair;
    if (encryption instanceof SparkError) return encryption as ErrorTypes.ErrorInterface;
    if (signing instanceof SparkError) return signing as ErrorTypes.ErrorInterface;
    return {
      encryption: encryption.publicKey,
      signing: signing.publicKey
    } as SparkTypes.PublicKeys;
  }

  get secretKeys(): SparkTypes.SecretKeys | ErrorTypes.ErrorInterface {
    const encryption = this.encryptionKeys() as CipherTypes.KeyPair;
    const signing = this.signingKeys() as SignerTypes.KeyPair;
    if (encryption instanceof SparkError) return encryption as ErrorTypes.ErrorInterface;
    if (signing instanceof SparkError) return signing as ErrorTypes.ErrorInterface;
    return {
      encryption: encryption.secretKey,
      signing: signing.secretKey
    }
  }

  get encryptionKeys(): C['getKeyPair'] {
    return this.cipher.getKeyPair;
  }

  get signingKeys(): S['getKeyPair'] {
    return this.signer.getKeyPair;
  }

  get initEncryptionKeys(): C['initKeyPair'] {
    return this.cipher.initKeyPair;
  }

  get computSharedEncryptionKey(): C['computeSharedKey'] {
    return this.cipher.computeSharedKey;
  }

  get encrypt(): C['encrypt'] {
    return this.cipher.encrypt;
  }

  get decrypt(): C['decrypt'] {
    return this.cipher.decrypt;
  }

  get hash(): H['hash'] {
    return this.hasher.hash;
  }

  get initSingingKeys(): S['initKeyPair'] {
    return this.signer.initKeyPair;
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

  get incept(): ControllerTypes.ControllerInterface['incept'] {
    return this.controller.incept;
  }

  get rotate(): ControllerTypes.ControllerInterface['rotate'] {
    return this.controller.rotate;
  }

  get destroy(): ControllerTypes.ControllerInterface['destroy'] {
    return this.controller.destroy;
  }

  import(data: CipherTypes.CipherText): Promise<void | ErrorTypes.ErrorInterface> {
    return Promise.resolve();
  }

  export(): Promise<HasherTypes.Hash> {
    return Promise.resolve('');
  }
}