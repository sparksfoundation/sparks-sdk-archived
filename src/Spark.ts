import { KeyPairs, PublicKeys } from "./types";
import { SparkInterface } from "./types";
import { CoreAgent } from "./agents/CoreAgent";
import { CoreCipher } from "./ciphers/CoreCipher";
import { CoreHasher } from "./hashers/CoreHasher";
import { CoreSigner } from "./signers/CoreSigner";
import { CoreController } from "./controllers";
import { Constructable, UnwrapPromise } from "./utilities/types";
import { CipherKeyPair } from "./ciphers/types";
import { SignerKeyPair } from "./signers/types";

export class Spark<
  A extends CoreAgent[],
  X extends CoreCipher,
  C extends CoreController,
  H extends CoreHasher,
  S extends CoreSigner
> implements SparkInterface<A, X, C, H, S> {

  public readonly cipher: X;
  public readonly controller: C;
  public readonly hasher: H;
  public readonly signer: S;
  public readonly agents: { [key: string]: CoreAgent } = {};

  constructor({
    agents,
    cipher,
    controller,
    hasher,
    signer
  }: {
    agents?: Constructable<A[number]>[];
    cipher: Constructable<X>;
    controller: Constructable<C>;
    hasher: Constructable<H>;
    signer: Constructable<S>;
  }) {

    this.cipher = new cipher(this);
    this.hasher = new hasher(this);
    this.signer = new signer(this);
    this.controller = new controller(this);

    if (agents && Array.isArray(agents) && agents.length > 0) {
      agents.forEach((agent) => {
        const _agent = new agent(this);
        const name = agent.constructor.name.charAt(0).toLowerCase() + agent.constructor.name.slice(1);
        this.agents[name] = _agent;
      });
    }

    Object.defineProperties(this, {
      agents: { enumerable: false, writable: false },
      cipher: { enumerable: false, writable: false },
      hasher: { enumerable: false, writable: false },
      signer: { enumerable: false, writable: false },
      controller: { enumerable: false, writable: false },
    });
  }

  // Private helper methods not exposed in the interface

  // generateKeyPairs can be called with either same or separate params for both or cipher and signer
  private async generateKeyPairs(params:
    Parameters<X['generateKeyPair']>[0] &
    Parameters<S['generateKeyPair']>[0]
  ): Promise<{
    cipher: UnwrapPromise<ReturnType<X['generateKeyPair']>>,
    signer: UnwrapPromise<ReturnType<S['generateKeyPair']>>
  }>;

  private async generateKeyPairs(params: {
    cipher: Parameters<X['generateKeyPair']>[0],
    signer: Parameters<S['generateKeyPair']>[0]
  }): Promise<{
    cipher: UnwrapPromise<ReturnType<X['generateKeyPair']>>,
    signer: UnwrapPromise<ReturnType<S['generateKeyPair']>>
  }>;

  private async generateKeyPairs(params?: any): Promise<{
    cipher: UnwrapPromise<ReturnType<X['generateKeyPair']>>,
    signer: UnwrapPromise<ReturnType<S['generateKeyPair']>>
  }> {
    const signer = ('signer' in params) ? params?.signer : params;
    const cipher = ('cipher' in params) ? params?.cipher : params;
    const signerKeyPair = await this.signer.generateKeyPair(signer) as UnwrapPromise<ReturnType<S['generateKeyPair']>>;
    const cipherKeyPair = await this.cipher.generateKeyPair(cipher) as UnwrapPromise<ReturnType<X['generateKeyPair']>>;
    return Promise.resolve({ signer: signerKeyPair, cipher: cipherKeyPair });
  };

  // sets the key pairs for both cipher and signer
  private setKeyPairs = async (params: {
    cipher: Parameters<X['setKeyPair']>[0],
    signer: Parameters<S['setKeyPair']>[0]
  }) => {
    const { cipher, signer } = params;
    this.signer.setKeyPair(signer);
    this.cipher.setKeyPair(cipher);
  }

  // todo - try to fix the as requirement
  public get keyPairs(): {
    signer: ReturnType<S['getKeyPair']>,
    cipher: ReturnType<X['getKeyPair']>,
  } {
    const cipher = this.cipher.getKeyPair() as ReturnType<S['getKeyPair']>;
    const signer = this.signer.getKeyPair() as ReturnType<X['getKeyPair']>;
    return { cipher, signer };
  }

  public get secretKeys(): {
    cipher: ReturnType<X['getSecretKey']>,
    signer: ReturnType<S['getSecretKey']>,
  } {
    return {
      cipher: this.cipher.getSecretKey() as ReturnType<X['getSecretKey']>,
      signer: this.signer.getSecretKey() as ReturnType<S['getSecretKey']>,
    };
  }

  public get publicKeys(): SparkInterface<A, X, C, H, S>['publicKeys'] {
    const keyPairs = this.keyPairs as KeyPairs;
    return {
      cipher: keyPairs.cipher.publicKey as ReturnType<X['getPublicKey']>,
      signer: keyPairs.signer.publicKey as ReturnType<S['getPublicKey']>,
    };
  }

  get keyEventLog(): C['getKeyEventLog'] {
    return this.controller.getKeyEventLog;
  }

  // public facing properties and interface methods
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

  public incept: {
    (params: Parameters<X['generateKeyPair']>[0] & Parameters<S['generateKeyPair']>[0]): Promise<void>;
    (params: { cipher: Parameters<X['generateKeyPair']>[0], signer: Parameters<S['generateKeyPair']>[0] }): Promise<void>;
  } = async (params?: any) => {
    if ('cipher' in params && 'signer' in params) {
      const keyPairs = await this.generateKeyPairs(params);
      this.setKeyPairs(keyPairs);
    } else if (params && typeof params === 'object') {
      throw new Error('Both cipher and signer parameters are required.');
    } else {
      const keyPairs = await this.generateKeyPairs({ cipher: params, signer: params });
      this.setKeyPairs(keyPairs);
    }
    await this.controller.incept();
  };

  public rotate: {
    (params: Parameters<X['generateKeyPair']>[0] & Parameters<S['generateKeyPair']>[0]): Promise<void>;
    (params: { cipher: Parameters<X['generateKeyPair']>[0], signer: Parameters<S['generateKeyPair']>[0] }): Promise<void>;
  } = async (params) => {
    const nextKeyPairs = await this.generateKeyPairs(params);
    await this.controller.rotate({ nextKeyPairs });
    this.setKeyPairs(nextKeyPairs);
  }

  public destroy: SparkInterface<A, X, C, H, S>['destroy'] = async (params) => {
    await this.controller.destroy();
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
}