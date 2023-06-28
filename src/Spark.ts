import { Constructable, KeyPairs, PublicKeys, SecretKeys, SparkParams } from "./types";
import { CipherKeyPair } from "./ciphers/types";
import { SignedEncryptedData, SignerKeyPair } from "./signers/types";
import { SparkInterface } from "./types";
import { AgentCore } from "./agents/AgentCore";
import { CipherCore } from "./ciphers/CipherCore";
import { HasherCore } from "./hashers/HasherCore";
import { SignerCore } from "./signers/SignerCore";
import { ControllerCore } from "./controllers";

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
  public get publicKeys(): PublicKeys {
    const keyPairs = this.keyPairs as KeyPairs;
    return {
      cipher: keyPairs.cipher.publicKey,
      signer: keyPairs.signer.publicKey,
    } as PublicKeys;
  }

  public get secretKeys(): SecretKeys {
    const keyPairs = this.keyPairs as KeyPairs;
    return {
      cipher: keyPairs.cipher.secretKey,
      signer: keyPairs.signer.secretKey,
    } as SecretKeys;
  }

  public get keyPairs(): KeyPairs {
    const cipher = this.cipher.getKeyPair();
    const signer = this.signer.getKeyPair();
    return { cipher, signer } as KeyPairs;
  }

  // todo fix typings here
  public async generateKeyPairs(params?: any): Promise<KeyPairs> {
    const { cipher, signer } = params || {}; 
    const signerKeyPair = await this.signer.generateKeyPair(signer || params) as SignerKeyPair;
    const cipherKeyPair = await this.cipher.generateKeyPair(cipher || params) as CipherKeyPair;
    return { signer: signerKeyPair, cipher: cipherKeyPair } as KeyPairs;
  }

  // todo fix typings here
  public async setKeyPairs(params: any): Promise<void> {
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

  get keyEventLog(): ReturnType<C['getKeyEventLog']> {
    return this.controller.getKeyEventLog() as ReturnType<C['getKeyEventLog']>;
  }

  public async incept(params?: any) {
    const keyPairs = await this.generateKeyPairs(params);
    await this.setKeyPairs(keyPairs);
    await this.controller.incept();
  }

  public async rotate(params?: any) {
    const nextKeyPairs = await this.generateKeyPairs(params);
    await this.controller.rotate({ nextKeyPairs });
    await this.setKeyPairs(nextKeyPairs);
  }

  public async destroy(params?: any) {
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

  public async import(data: SignedEncryptedData): Promise<void> {
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

  public async export(): Promise<SignedEncryptedData> {
    // create an object with all the data
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