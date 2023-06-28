import { KeyPairs, PublicKeys, SecretKeys, SparkParams } from "./types";
import { Constructable } from "./utilities/types";
import { SparkInterface } from "./types";
import { AgentCore } from "./agents/AgentCore";
import { CipherCore } from "./ciphers/CipherCore";
import { HasherCore } from "./hashers/HasherCore";
import { SignerCore } from "./signers/SignerCore";
import { ControllerCore } from "./controllers";
import { UnwrapPromise } from "./utilities/types";

export class Spark<
  A extends AgentCore[],
  X extends CipherCore,
  C extends ControllerCore,
  H extends HasherCore,
  S extends SignerCore
> implements SparkInterface<A, X, C, H, S> {

  public readonly cipher: X;
  public readonly controller: C;
  public readonly hasher: H;
  public readonly signer: S;
  public readonly agents: { [key: string]: InstanceType<Constructable<A[number]>> } = {};

  constructor({
    agents = [],
    cipher,
    controller,
    hasher,
    signer
  }: SparkParams<A, X, C, H, S>) {

    this.cipher = new cipher();
    this.hasher = new hasher();
    this.signer = new signer();
    this.controller = new controller(this);

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
  public get publicKeys(): SparkInterface<A, X, C, H, S>['publicKeys'] {
    const keyPairs = this.keyPairs as KeyPairs;
    return {
      cipher: keyPairs.cipher.publicKey,
      signer: keyPairs.signer.publicKey,
    } as PublicKeys;
  }

  public get secretKeys(): SparkInterface<A, X, C, H, S>['secretKeys'] {
    const keyPairs = this.keyPairs as KeyPairs;
    return {
      cipher: keyPairs.cipher.secretKey,
      signer: keyPairs.signer.secretKey,
    } as SecretKeys;
  }

  public get keyPairs(): SparkInterface<A, X, C, H, S>['keyPairs'] {
    const cipher = this.cipher.getKeyPair();
    const signer = this.signer.getKeyPair();
    return { cipher, signer } as KeyPairs;
  }

  public generateKeyPairs: SparkInterface<A, X, C, H, S>['generateKeyPairs'] = async (params) => {
    const { cipher, signer } = params || {};
    console.log(cipher, signer)
    const signerKeyPair = await this.signer.generateKeyPair(signer) as UnwrapPromise<ReturnType<S['generateKeyPair']>>;
    const cipherKeyPair = await this.cipher.generateKeyPair(cipher) as UnwrapPromise<ReturnType<X['generateKeyPair']>>;
    return Promise.resolve({ signer: signerKeyPair, cipher: cipherKeyPair });
  };

  public setKeyPairs: SparkInterface<A, X, C, H, S>['setKeyPairs'] = async (params: any) => {
    const { cipher, signer } = params || {};
    this.signer.setKeyPair(signer || params);
    this.cipher.setKeyPair(cipher || params);
  }

  // cipher
  get generateCipherSharedKey(): X['generateSharedKey'] {
    return this.cipher.generateSharedKey;
  }

  get setCipherKeyPair(): X['setKeyPair'] {
    return this.cipher.setKeyPair;
  }

  get encrypt(): X['encrypt'] {
    return this.cipher.encrypt;
  }

  get decrypt(): X['decrypt'] {
    return this.cipher.decrypt;
  }

  // controller
  get identifier(): ReturnType<C['getIdentifier']> {
    try {
      return this.controller.getIdentifier() as ReturnType<C['getIdentifier']>;
    } catch (error) {
      return null;
    }
  }

  get keyEventLog(): C['getKeyEventLog'] {
    return this.controller.getKeyEventLog;
  }

  public incept: SparkInterface<A, X, C, H, S>['incept'] = async (params) => {
    const keyPairs = await this.generateKeyPairs(params);
    await this.setKeyPairs(keyPairs);
    await this.controller.incept();
  }

  public rotate: SparkInterface<A, X, C, H, S>['rotate'] = async (params) => {
    const nextKeyPairs = await this.generateKeyPairs(params);
    await this.controller.rotate({ nextKeyPairs });
    await this.setKeyPairs(nextKeyPairs);
  }

  public destroy: SparkInterface<A, X, C, H, S>['destroy'] = async (params) => {
    await this.controller.destroy();
  }

  // hasher
  get hash(): H['hash'] {
    return this.hasher.hash;
  }

  // signer
  get generateSignerKeyPair(): S['generateKeyPair'] {
    return this.signer.generateKeyPair;
  }

  get setSignerKeyPair(): S['setKeyPair'] {
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

  public import: SparkInterface<A, X, C, H, S>['import'] = async (data) => {
    const opened = await this.signer.open({ signature: data, publicKey: this.publicKeys.signer });
    const decrypted = await this.cipher.decrypt({ data: opened }) as Record<string, any>;

    await Promise.all(
      Object.entries(this.agents).map(async ([key, agent]) => {
        await agent.import(decrypted);
      })
    );
    
    await Promise.all([
      this.cipher.import(decrypted),
      this.hasher.import(decrypted),
      this.signer.import(decrypted),
      this.controller.import(decrypted),
    ]);
  }

  public export: SparkInterface<A, X, C, H, S>['export'] = async () => {
    const data = {};

    await Promise.all(
      Object.entries(this.agents).map(async ([key, agent]) => {
        data[key] = await agent.export();
      })
    );

    Object.assign(data, {
      cipher: await this.cipher.export(),
      hasher: await this.hasher.export(),
      signer: await this.signer.export(),
      controller: await this.controller.export(),
    });

    const encrypted = await this.cipher.encrypt({ data });
    const signed = await this.signer.seal({ data: encrypted });
    return signed;
  }
}