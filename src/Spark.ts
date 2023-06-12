import { Controller } from './controllers/index.js';
import { Agent } from './agents/index.js';
import { Signer } from './signers/index.js';
import { Cipher } from './ciphers/index.js';
import { Hasher } from './hashers/index.js';
import { Channel } from './channels/index.js';
import { Storage } from './storage/index.js';

export class Spark {
  private controller: typeof Controller;
  private signer: typeof Signer;
  private cipher: typeof Cipher;
  private hasher: typeof Hasher;
  private storage: typeof Storage;
  private agents: { [key: string]: typeof Agent };
  private channels: { [key: string]: typeof Channel };

  constructor(options) {
    this.controller = options.controller ? new options.controller(this) : null;
    if (this.controller && !(this.controller instanceof Controller)) {
      throw new Error('controller must be an instance of Controller')
    }

    this.signer = options.signer ? new options.signer(this) : null;
    if (this.signer && !(this.signer instanceof Signer)) {
      throw new Error('signer must be an instance of Signer')
    }

    this.cipher = options.cipher ? new options.cipher(this) : null;
    if (this.cipher && !(this.cipher instanceof Cipher)) {
      throw new Error('cipher must be an instance of Cipher')
    }

    this.hasher = options.hasher ? new options.hasher(this) : null;
    if (this.hasher && !(this.hasher instanceof Hasher)) {
      throw new Error('hasher must be an instance of Hasher')
    }

    this.storage = options.storage ? new options.storage(this) : null;
    if (this.storage && !(this.storage instanceof Storage)) {
      throw new Error('storage must be an instance of Storage')
    }

    if (options.agents?.length) {
      this.agents = {}
      options.agents.map(agent => {
        const name = agent.name.toLowerCase();
        if (this.agents[name]) {
          throw new Error(`agent name ${name} already exists`)
        }
        this.agents[name] = new agent(this);
        if (!(this.agents[name] instanceof Agent)) {
          throw new Error('channel must be an instance of Agent')
        }
      })
    }

    if (options.channels?.length) {
      this.channels = {}
      options.channels.map(channel => {
        const name = channel.name.toLowerCase();
        if (this.channels[name]) {
          throw new Error(`channel name ${name} already exists`)
        }
        this.channels[name] = new channel(this);
        if (!(this.channels[name] instanceof Channel)) {
          throw new Error('channel must be an instance of Channel')
        }
      })
    }
  }
}