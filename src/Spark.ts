import { Controller, EncryptionKeyPair, Identifier, KeyEventLog, KeyPairs, PublicKeys, SigningKeyPair } from './controllers/index';
import { Agent } from './agents/index';
import { Signer } from './signers/index';
import { Cipher } from './ciphers/index';
import { Hasher } from './hashers/index';

interface Constructable<T> {
  new(...args: any): T;
}

type SparkOptions = {
  controller: Constructable<Controller>;
  signer: Constructable<Signer>;
  cipher: Constructable<Cipher>;
  hasher: Constructable<Hasher>;
  agents: Constructable<Agent>[];
}

export interface SparkI {
  identifier: Identifier;
  keyEventLog: KeyEventLog;
  publicKeys: PublicKeys;
  encryptionKeys: EncryptionKeyPair;
  signingKeys: SigningKeyPair;
  keyPairs: KeyPairs;
  hash: (data: any) => Promise<string> | never;
  sign: ({ data, detached }: { data: object | string; detached: boolean }) => Promise<string> | never;
  verify: ({ publicKey, signature, data }: { publicKey: string, signature: string, data?: object | string }) => Promise<boolean> | Promise<string | object | null> | never;
}

export class Spark implements SparkI {
  private cipher: Cipher;
  private controller: Controller;
  private hasher: Hasher;
  private signer: Signer;
  private agents: object = {};

  constructor(options: SparkOptions) {
    this.cipher = new options.cipher(this);
    this.controller = new options.controller(this);
    this.hasher = new options.hasher(this);
    this.signer = new options.signer(this);
    const agents = options.agents || [];
    agents.forEach(agent => {
      const mixin = new agent(this);
      this.agents[agent.name.toLowerCase()] = mixin;
    })
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

  sign(args: any): Promise<string> | never {
    return this.signer.sign(args);
  }

  verify(args: any): Promise<boolean> | Promise<string | object | null> | never {
    return this.signer.verify(args);
  }

  hash(args: any): Promise<string> | never {
    return this.hasher.hash(args);
  }

  incept(args: any): Promise<void> | never {
    return this.controller.incept(args);
  }

  rotate(args: any): Promise<void> | never {
    return this.controller.rotate(args);
  }

  delete(args: any): Promise<void> | never {
    return this.controller.delete(args);
  }

  encrypt(args: any): Promise<string> | never {
    return this.cipher.encrypt(args);
  }

  decrypt(args: any): Promise<string | Record<string, any>> | never {
    return this.cipher.decrypt(args);
  }

  import(args: any): Promise<void> | never {
    return this.controller.import(args);
  }

  export(args?: any): Promise<string> | never {
    return this.controller.export(args);
  }

  computeSharedKey(args: any): Promise<string> | never {
    return this.cipher.computeSharedKey(args);
  };
}
