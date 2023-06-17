import { Controller } from './controllers/index.js';
import { Agent } from './agents/index.js';
import { Signer } from './signers/index.js';
import { Cipher } from './ciphers/index.js';
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
};

const FACTORIES = {
  channels: Channel,
};

export class Spark {
  public controller: Controller;
  public signer: Signer;
  public cipher: Cipher;
  public hasher: Hasher;
  public storage: Storage;
  public agents: { [key: string]: Agent };
  public channels: { [key: string]: typeof Channel };

  constructor(options) {
    Object.keys(options).forEach(prop => {
      if (SINGLETONS[prop]) {
        const instance = new options[prop](this);
        const valid = instance && instance instanceof SINGLETONS[prop];
        const typeName = SINGLETONS[prop].name;
        if (!valid) throw new Error(`${prop} must be an instance of ${typeName}`);
        this[prop] = instance;
        Object.defineProperties(instance, {
          spark: { enumerable: false, writable: false, }
        })
      } else if (COLLECTIONS[prop]) {
        this[prop] = {}
        options[prop].forEach(clazz => {
          const name = clazz.name;
          const instance = new clazz(this);
          const valid = instance && instance instanceof COLLECTIONS[prop];
          const typeName = COLLECTIONS[prop].name;
          if (!valid) throw new Error(`${prop} must be an instance of ${typeName}`);
          const camel = name.charAt(0).toLowerCase() + name.slice(1);
          this[prop][camel] = instance;
          Object.defineProperties(instance, {
            spark: { enumerable: false, writable: false, }
          })
        })
      } else if (FACTORIES[prop]) {
        this[prop] = {}
        options[prop].forEach(clazz => {
          const name = clazz.name;
          const valid = clazz.prototype instanceof FACTORIES[prop];
          const typeName = FACTORIES[prop].name;
          if (!valid) throw new Error(`${prop} must be an extension of ${typeName}`);
          const self = this;
          class Factory extends clazz {
            constructor(args) {
              super({ spark: self, ...args });
            }
          }
          Object.defineProperty(Factory, 'name', { value: name, writable: false });
          this[prop][name] = Factory as typeof clazz;
        })
      } else {
        throw new Error(`invalid option ${prop}`);
      }
    })
  }
}