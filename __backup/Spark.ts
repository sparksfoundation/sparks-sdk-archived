import { AController, EncryptionKeyPair, Identifier, KeyEventLog, KeyPairs, PublicKeys, SigningKeyPair } from './controllers/index';
import { ASigner } from './signers/index';
import { ACipher } from './ciphers/index';
import { AHasher } from './hashers/index';
import { AAgent } from './agents/Agent/types';

interface Constructable<T> {
  new (...args: any[]): T;
}

type SparkOptions<C extends AController, S extends ASigner, Cp extends ACipher, H extends AHasher, A extends AAgent[]> = {
  controller: Constructable<C>;
  signer: Constructable<S>;
  cipher: Constructable<Cp>;
  hasher: Constructable<H>;
  agents: Constructable<A[number]>[];
};

export interface ISpark<C extends AController, S extends ASigner, Cp extends ACipher, H extends AHasher, A extends AAgent[]> {
  identifier: Identifier;
  keyEventLog: KeyEventLog;
  publicKeys: PublicKeys;
  encryptionKeys: EncryptionKeyPair;
  signingKeys: SigningKeyPair;
  keyPairs: KeyPairs;
  agents: { [name: string]: InstanceType<Constructable<A[number]>> };
  sign: S['sign'];
  verify: S['verify'];
  hash: H['hash'];
  encrypt: Cp['encrypt'];
  decrypt: Cp['decrypt'];
  computeSharedKey: Cp['computeSharedKey'];
  incept: C['incept'];
  rotate: C['rotate'];
  delete: C['delete'];
}

export class Spark<C extends AController, S extends ASigner, Cp extends ACipher, H extends AHasher, A extends AAgent[]> implements ISpark<C, S, Cp, H, A> {
  public cipher: Cp;
  public controller: C;
  public hasher: H;
  public signer: InstanceType<Constructable<S>>;
  public agents: { [name: string]: InstanceType<Constructable<A[number]>> } = {};

  constructor(options: SparkOptions<C, S, Cp, H, A>) {
    this.cipher = new options.cipher(this);
    this.controller = new options.controller(this);
    this.hasher = new options.hasher(this);
    this.signer = new options.signer(this);

    const agents = options.agents || [];
    agents.forEach((agent: Constructable<A[number]>) => {
      const mixin = new agent(this);
      const name = agent.name.charAt(0).toLowerCase() + agent.name.slice(1);
      this.agents[name] = mixin;
    });
  }

  get identifier(): Identifier {
    return this.controller.identifier;
  }

  get keyEventLog(): KeyEventLog {
    return this.controller.keyEventLog;
  }

  get encryptionKeys(): EncryptionKeyPair {
    return this.controller.encryptionKeys;
  }

  get signingKeys(): SigningKeyPair {
    return this.controller.signingKeys;
  }

  get publicKeys(): PublicKeys {
    return this.controller.publicKeys;
  }

  get keyPairs(): KeyPairs {
    return this.controller.keyPairs;
  }

  get sign (): S['sign'] {
    return this.signer.sign;
  }

  get verify (): S['verify'] {
    return this.signer.verify;
  }

  get hash (): H['hash'] {
    return this.hasher.hash;
  }

  get encrypt (): Cp['encrypt'] {
    return this.cipher.encrypt;
  }

  get decrypt (): Cp['decrypt'] {
    return this.cipher.decrypt;
  }

  get computeSharedKey (): Cp['computeSharedKey'] {
    return this.cipher.computeSharedKey.bind(this.cipher);
  }

  get incept (): C['incept'] {
    return this.controller.incept;
  }

  get rotate (): C['rotate'] {
    return this.controller.rotate;
  }

  get delete (): C['delete'] {
    return this.controller.delete;
  }

  get import (): C['import'] {
    return this.controller.import;
  }

  get export (): C['export'] {
    return this.controller.export;
  }
}
