import { SparkAgentInterface } from "../agents/SparkAgent/types";
import { SparkCipherInterface } from "../ciphers/SparkCipher/types";
import { SparkControllerInterface } from "../controllers/SparkController/types";
import { SparkHasherInterface } from "../hashers/SparkHasher/types";
import { SparkSignerInterface } from "../signers/SparkSigner/types";
import { Constructable, UnwrapPromise } from "../utilities/types";
import { SignedEncryptedData, SparkInterface } from "./types";

export class Spark<
  Agents extends SparkAgentInterface[],
  Cipher extends SparkCipherInterface,
  Controller extends SparkControllerInterface,
  Hasher extends SparkHasherInterface,
  Signer extends SparkSignerInterface,
> implements SparkInterface<Agents, Cipher, Controller, Hasher, Signer> {

  readonly agents: { [key: string]: Agents[number] };
  readonly cipher: Cipher;
  readonly controller: Controller;
  readonly hasher: Hasher;
  readonly signer: Signer;

  constructor({ agents, cipher, controller, hasher, signer }: {
    agents?: Constructable<Agents[number]>[],
    cipher: Constructable<Cipher>,
    controller: Constructable<Controller>,
    hasher: Constructable<Hasher>,
    signer: Constructable<Signer>,
  }) {
    this.agents = {};
    this.cipher = new cipher(this);
    this.hasher = new hasher(this);
    this.signer = new signer(this);
    this.controller = new controller(this);

    if (agents && Array.isArray(agents) && agents.length > 0) {
      agents.forEach((agent, index) => {
        const _agent = new agent(this);
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

  get identifier(): Controller['identifier'] {
    return this.controller.identifier;
  }

  get publicKeys(): {
    cipher: Cipher['publicKey'],
    signer: Signer['publicKey'],
  } {
    return {
      cipher: this.cipher.publicKey,
      signer: this.signer.publicKey,
    };
  }

  get secretKeys(): {
    cipher: Cipher['secretKey'],
    signer: Signer['secretKey'],
  } {
    return {
      cipher: this.cipher.secretKey,
      signer: this.signer.secretKey,
    };
  }

  get keyPairs(): {
    signer: Signer['keyPair'],
    cipher: Cipher['keyPair'],
  } {
    return {
      signer: this.signer.keyPair,
      cipher: this.cipher.keyPair,
    };
  }

  get keyEventLog(): Controller['keyEventLog'] {
    return this.controller.keyEventLog;
  }

  // generateKeyPairs can be called with either same or separate params for both or cipher and signer
  private _generateKeyPairs: {
    (params: Parameters<Cipher['generateKeyPair']>[0] & Parameters<Signer['generateKeyPair']>[0]): Promise<{
      cipher: UnwrapPromise<ReturnType<Cipher['generateKeyPair']>>,
      signer: UnwrapPromise<ReturnType<Signer['generateKeyPair']>>
    }>;
    (params: { cipher: Parameters<Cipher['generateKeyPair']>[0], signer: Parameters<Signer['generateKeyPair']>[0] }): Promise<{
      cipher: UnwrapPromise<ReturnType<Cipher['generateKeyPair']>>,
      signer: UnwrapPromise<ReturnType<Signer['generateKeyPair']>>
    }>;
    (): Promise<{
      cipher: UnwrapPromise<ReturnType<Cipher['generateKeyPair']>>,
      signer: UnwrapPromise<ReturnType<Signer['generateKeyPair']>>
    }>;
  } = async (params?: any) => {
    const signerParams = params && params.signer ? params.signer : params;
    const cipherParams = params && params.cipher ? params.cipher : params;
    const signer = await this.signer.generateKeyPair(signerParams) as UnwrapPromise<ReturnType<Signer['generateKeyPair']>>;
    const cipher = await this.cipher.generateKeyPair(cipherParams) as UnwrapPromise<ReturnType<Cipher['generateKeyPair']>>;
    return Promise.resolve({ signer, cipher });
  };

  // sets the key pairs for both cipher and signer
  private _setKeyPairs = async (params: {
    cipher: Parameters<Cipher['setKeyPair']>[0],
    signer: Parameters<Signer['setKeyPair']>[0]
  }) => {
    const { cipher, signer } = params;
    this.signer.setKeyPair(signer);
    this.cipher.setKeyPair(cipher);
  }

  // public facing properties and interface methods
  public import: {
    (params: Parameters<Cipher['generateKeyPair']>[0] & Parameters<Signer['generateKeyPair']>[0] & { data: SignedEncryptedData }): Promise<void>;
    (params: { cipher: Parameters<Cipher['generateKeyPair']>[0], signer: Parameters<Signer['generateKeyPair']>[0], data: SignedEncryptedData }): Promise<void>;
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

  public export: SparkInterface<Agents, Cipher, Controller, Hasher, Signer>['export'] = async () => {
    const data: {
      agents: Record<string, any>,
      channels: Record<string, any>[],
    } = {
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

  public incept: {
    (params: Parameters<Cipher['generateKeyPair']>[0] & Parameters<Signer['generateKeyPair']>[0]): Promise<void>;
    (params: { cipher: Parameters<Cipher['generateKeyPair']>[0], signer: Parameters<Signer['generateKeyPair']>[0] }): Promise<void>;
    (): Promise<void>;
  } = async (params?: any) => {
    const keyPairs = await this._generateKeyPairs(params);
    this._setKeyPairs(keyPairs);
    await this.controller.incept();
  };

  public rotate: {
    (params: Parameters<Cipher['generateKeyPair']>[0] & Parameters<Signer['generateKeyPair']>[0]): Promise<void>;
    (params: { cipher: Parameters<Cipher['generateKeyPair']>[0], signer: Parameters<Signer['generateKeyPair']>[0] }): Promise<void>;
  } = async (params) => {
    const nextKeyPairs = await this._generateKeyPairs(params);
    await this.controller.rotate({ nextKeyPairs });
    this._setKeyPairs(nextKeyPairs);
  }

  public destroy: SparkInterface<Agents, Cipher, Controller, Hasher, Signer>['destroy'] = async (params) => {
    await this.controller.destroy();
  }

  // cipher facade
  get generateCipherSharedKey(): Cipher['generateSharedKey'] {
    return this.cipher.generateSharedKey;
  }

  get encrypt(): Cipher['encrypt'] {
    return this.cipher.encrypt;
  }

  get decrypt(): Cipher['decrypt'] {
    return this.cipher.decrypt;
  }

  // hasher facade
  get hash(): Hasher['hash'] {
    return this.hasher.hash;
  }

  // signer facade
  get sign(): Signer['sign'] {
    return this.signer.sign;
  }

  get seal(): Signer['seal'] {
    return this.signer.seal;
  }

  get verify(): Signer['verify'] {
    return this.signer.verify;
  }

  get open(): Signer['open'] {
    return this.signer.open;
  }
}
