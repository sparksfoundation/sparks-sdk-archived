import { Controller } from './controllers/index.js';
import { Agent } from './agents/index.js';
import { Signer } from './signers/index.js';
import { Cipher } from './ciphers/index.js';
import { Hasher } from './hashers/index.js';
import { ChannelManager } from './channels/index.js';
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
  channels: ChannelManager,
};

export class Spark {
  constructor(options) {
    Object.keys(options).forEach(prop => {
      if (SINGLETONS[prop]) {
        const mixin = new options[prop](this);
        const valid = mixin && mixin instanceof SINGLETONS[prop];
        const typeName = SINGLETONS[prop].name;
        if (!valid) throw new Error(`${prop} must be an instance of ${typeName}`);
        this[prop] = mixin;
        Object.defineProperties(mixin, {
          spark: { enumerable: false, writable: false, }
        })
      } else if (COLLECTIONS[prop]) {
        this[prop] = {}
        options[prop].forEach(clazz => {
          const name = clazz.name;
          const mixin = new clazz(this);
          const valid = mixin && mixin instanceof COLLECTIONS[prop];
          const typeName = COLLECTIONS[prop].name;
          if (!valid) throw new Error(`${prop} must be an instance of ${typeName}`);
          const camel = name.charAt(0).toLowerCase() + name.slice(1);
          this[prop][camel] = mixin;
          Object.defineProperties(mixin, {
            spark: { enumerable: false, writable: false, }
          })
        })
      } else {
        throw new Error(`invalid option ${prop}`);
      }
    })
  }
}