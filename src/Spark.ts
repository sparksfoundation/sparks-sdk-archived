import { ConstructableChannel, KeyPairs } from "./types";
import { SparkInterface } from "./types";
import { CoreAgent } from "./agents/CoreAgent";
import { CoreCipher } from "./ciphers/CoreCipher";
import { CoreHasher } from "./hashers/CoreHasher";
import { CoreSigner } from "./signers/CoreSigner";
import { CoreController } from "./controllers";
import { Constructable, UnwrapPromise } from "./utilities/types";
import { SignedEncryptedData } from "./signers/types";

export class Spark<
  A extends CoreAgent[],
  X extends CoreCipher,
  C extends CoreController,
  H extends CoreHasher,
  S extends CoreSigner,
> implements SparkInterface<A, X, C, H, S> {

  public readonly cipher: X;
  public readonly controller: C;
  public readonly hasher: H;
  public readonly signer: S;
  public readonly agents: { [key: string]: InstanceType<Constructable<A[number]>> } = {};

  public static availableChannels: ConstructableChannel[] = [];

  constructor({
    agents,
    cipher,
    controller,
    hasher,
    signer,
  }: {
    agents?: Array<new (spark: Spark<A, X, C, H, S>) => A[number]>;
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
        const _agent = new agent(this) as InstanceType<Constructable<A[number]>>;
        const name = agent.name.charAt(0).toLowerCase() + agent.name.slice(1);
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
  private _generateKeyPairs: {
    (params: Parameters<X['generateKeyPair']>[0] & Parameters<S['generateKeyPair']>[0]): Promise<{
      cipher: UnwrapPromise<ReturnType<X['generateKeyPair']>>,
      signer: UnwrapPromise<ReturnType<S['generateKeyPair']>>
    }>;
    (params: { cipher: Parameters<X['generateKeyPair']>[0], signer: Parameters<S['generateKeyPair']>[0] }): Promise<{
      cipher: UnwrapPromise<ReturnType<X['generateKeyPair']>>,
      signer: UnwrapPromise<ReturnType<S['generateKeyPair']>>
    }>;
    (): Promise<{
      cipher: UnwrapPromise<ReturnType<X['generateKeyPair']>>,
      signer: UnwrapPromise<ReturnType<S['generateKeyPair']>>
    }>;
  } = async (params?: any) => {
    const signerParams = params && params.signer ? params.signer : params;
    const cipherParams = params && params.cipher ? params.cipher : params;
    const signer = await this.signer.generateKeyPair(signerParams) as UnwrapPromise<ReturnType<S['generateKeyPair']>>;
    const cipher = await this.cipher.generateKeyPair(cipherParams) as UnwrapPromise<ReturnType<X['generateKeyPair']>>;
    return Promise.resolve({ signer, cipher });
  };

  // sets the key pairs for both cipher and signer
  private _setKeyPairs = async (params: {
    cipher: Parameters<X['setKeyPair']>[0],
    signer: Parameters<S['setKeyPair']>[0]
  }) => {
    const { cipher, signer } = params;
    this.signer.setKeyPair(signer);
    this.cipher.setKeyPair(cipher);
  }

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

  // public facing properties and interface methods
  public import: {
    (params: Parameters<X['generateKeyPair']>[0] & Parameters<S['generateKeyPair']>[0] & { data: SignedEncryptedData }): Promise<void>;
    (params: { cipher: Parameters<X['generateKeyPair']>[0], signer: Parameters<S['generateKeyPair']>[0], data: SignedEncryptedData }): Promise<void>;
  } = async (params?: any) => {
    const { data, ...keyPairParams } = params;
    const keyPairs = await this._generateKeyPairs(keyPairParams);
    this._setKeyPairs(keyPairs);

    const opened = await this.signer.open({ signature: data, publicKey: this.publicKeys.signer });
    const decrypted = await this.cipher.decrypt({ data: opened }) as Record<string, any>;

    await Promise.all(
      Object.entries(this.agents).map(async ([key, agent]) => {
        await agent.import(decrypted.agents[key]);
      })
    );
    
    await Promise.all([
      this.cipher.import(decrypted.cipher),
      this.hasher.import(decrypted.hasher),
      this.signer.import(decrypted.signer),
      this.controller.import(decrypted.controller),
    ]);
  }

  public export: SparkInterface<A, X, C, H, S>['export'] = async () => {
    const data = {
      agents: {},
      channels: [],
    };

    await Promise.all(
      Object.entries(this.agents).map(async ([key, agent]) => {
        data.agents[key] = await agent.export();
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


  // controller facade
  get identifier(): ReturnType<C['getIdentifier']> {
    try {
      return this.controller.getIdentifier() as ReturnType<C['getIdentifier']>;
    } catch (error) {
      return null;
    }
  }

  public get keyEventLog(): ReturnType<C['getKeyEventLog']> {
    return this.controller.getKeyEventLog() as ReturnType<C['getKeyEventLog']>;
  }

  public incept: {
    (params: Parameters<X['generateKeyPair']>[0] & Parameters<S['generateKeyPair']>[0]): Promise<void>;
    (params: { cipher: Parameters<X['generateKeyPair']>[0], signer: Parameters<S['generateKeyPair']>[0] }): Promise<void>;
    (): Promise<void>;
  } = async (params?: any) => {
    const keyPairs = await this._generateKeyPairs(params);
    this._setKeyPairs(keyPairs);
    await this.controller.incept();
  };

  public rotate: {
    (params: Parameters<X['generateKeyPair']>[0] & Parameters<S['generateKeyPair']>[0]): Promise<void>;
    (params: { cipher: Parameters<X['generateKeyPair']>[0], signer: Parameters<S['generateKeyPair']>[0] }): Promise<void>;
  } = async (params) => {
    const nextKeyPairs = await this._generateKeyPairs(params);
    await this.controller.rotate({ nextKeyPairs });
    this._setKeyPairs(nextKeyPairs);
  }

  public destroy: SparkInterface<A, X, C, H, S>['destroy'] = async (params) => {
    await this.controller.destroy();
  }

  // cipher facade
  get generateCipherSharedKey(): X['generateSharedKey'] {
    return this.cipher.generateSharedKey;
  }

  get encrypt(): X['encrypt'] {
    return this.cipher.encrypt;
  }

  get decrypt(): X['decrypt'] {
    return this.cipher.decrypt;
  }

  // hasher facade
  get hash(): H['hash'] {
    return this.hasher.hash;
  }

  // signer facade
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