import { Controller, EncryptionKeyPair, KeyPairs, SigningKeyPair } from './controllers/index.js';
import { Agent } from './agents/index.js';
import { Signer } from './signers/index.js';
import { Cipher, ICipher } from './ciphers/index.js';
import { Hasher } from './hashers/index.js';
import { Channel } from './channels/index.js';
import { Storage } from './storage/index.js';

const SINGLETONS = {
  controller: Controller,
  signer: Signer,
  cipher: Cipher,
  hasher: Hasher,
  storage: Storage,
};

const COLLECTIONS = {
  agents: Agent,
  channels: Channel,
};

interface Constructable<T> {
  new(...args: any): T;
}

type SparkOptions = {
  controller: Constructable<Controller>;
  signer: Constructable<Signer>;
  cipher: Constructable<Cipher>;
  hasher: Constructable<Hasher>;
  storage: Storage | null; // TODO make this non-nullable eventually
  agents: Constructable<Agent>[];
  channels: Channel[] | null; // TODO this too
}

export interface SparkI {
  // signer.verify -> verify
  // signer.sign   -> sign
  // hasher.hash   -> hash
  // controller.encryptionKeys -> encryptionKeys
    // secretKey
  // controller.keypairs -> keyPairs
  // signing.publicKey -> publicKey

  encryptionKeys: () => EncryptionKeyPair;
  signingKeys: () => SigningKeyPair;

  keypairs: () => KeyPairs;

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
  private channels: Channel[] = [];

  constructor(options: SparkOptions) {
    this.cipher = new options.cipher(this);
    this.controller = new options.controller(this);
    this.hasher = new options.hasher(this);
    this.signer = new options.signer(this);
    options.agents.forEach(agent => {
      const mixin = new agent(this);
      this.agents[agent.name.toLowerCase()] = mixin;
    })
  }

  encryptionKeys(): EncryptionKeyPair {
    return this.controller.encryptionKeys;
  }

  signingKeys(): SigningKeyPair {
    return this.controller.signingKeys;
  }

  keypairs(): KeyPairs {
    return this.controller.keypairs;
  }

  sign(args: { data: object | string; detached: boolean }): Promise<string> | never {
    return this.signer.sign(args);
  }

  verify(args: { publicKey: string, signature: string, data?: object | string }): Promise<boolean> | Promise<string | object | null> | never {
    return this.signer.verify(args);
  }

  hash(data: any): Promise<string> | never {
    return this.hasher.hash(data);
  }
}
