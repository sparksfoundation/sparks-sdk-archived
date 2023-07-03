export class Spark {
  constructor({
    agents,
    cipher,
    controller,
    hasher,
    signer
  }) {
    this.agents = {};
    // Private helper methods not exposed in the interface
    // generateKeyPairs can be called with either same or separate params for both or cipher and signer
    this._generateKeyPairs = async (params) => {
      const signerParams = params && params.signer ? params.signer : params;
      const cipherParams = params && params.cipher ? params.cipher : params;
      const signer = await this.signer.generateKeyPair(signerParams);
      const cipher = await this.cipher.generateKeyPair(cipherParams);
      return Promise.resolve({ signer, cipher });
    };
    // sets the key pairs for both cipher and signer
    this._setKeyPairs = async (params) => {
      const { cipher, signer } = params;
      this.signer.setKeyPair(signer);
      this.cipher.setKeyPair(cipher);
    };
    // public facing properties and interface methods
    this.import = async (params) => {
      const { data, ...keyPairParams } = params;
      const keyPairs = await this._generateKeyPairs(keyPairParams);
      this._setKeyPairs(keyPairs);
      const opened = await this.signer.open({ signature: data, publicKey: this.publicKeys.signer });
      const decrypted = await this.cipher.decrypt({ data: opened });
      await Promise.all(
        Object.entries(this.agents).map(async ([key, agent]) => {
          await agent.import(decrypted.agents[key]);
        })
      );
      await Promise.all([
        this.cipher.import(decrypted.cipher),
        this.hasher.import(decrypted.hasher),
        this.signer.import(decrypted.signer),
        this.controller.import(decrypted.controller)
      ]);
    };
    this.export = async () => {
      const data = {
        agents: {},
        channels: []
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
        controller: await this.controller.export()
      });
      const encrypted = await this.cipher.encrypt({ data });
      const signed = await this.signer.seal({ data: encrypted });
      return signed;
    };
    this.incept = async (params) => {
      const keyPairs = await this._generateKeyPairs(params);
      this._setKeyPairs(keyPairs);
      await this.controller.incept();
    };
    this.rotate = async (params) => {
      const nextKeyPairs = await this._generateKeyPairs(params);
      await this.controller.rotate({ nextKeyPairs });
      this._setKeyPairs(nextKeyPairs);
    };
    this.destroy = async (params) => {
      await this.controller.destroy();
    };
    this.cipher = new cipher(this);
    this.hasher = new hasher(this);
    this.signer = new signer(this);
    this.controller = new controller(this);
    if (agents && Array.isArray(agents) && agents.length > 0) {
      agents.forEach((agent) => {
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
      controller: { enumerable: false, writable: false }
    });
  }
  get keyPairs() {
    const cipher = this.cipher.getKeyPair();
    const signer = this.signer.getKeyPair();
    return { cipher, signer };
  }
  get secretKeys() {
    return {
      cipher: this.cipher.getSecretKey(),
      signer: this.signer.getSecretKey()
    };
  }
  get publicKeys() {
    const keyPairs = this.keyPairs;
    return {
      cipher: keyPairs.cipher.publicKey,
      signer: keyPairs.signer.publicKey
    };
  }
  // controller facade
  get identifier() {
    try {
      return this.controller.getIdentifier();
    } catch (error) {
      return null;
    }
  }
  get keyEventLog() {
    return this.controller.getKeyEventLog();
  }
  // cipher facade
  get generateCipherSharedKey() {
    return this.cipher.generateSharedKey;
  }
  get encrypt() {
    return this.cipher.encrypt;
  }
  get decrypt() {
    return this.cipher.decrypt;
  }
  // hasher facade
  get hash() {
    return this.hasher.hash;
  }
  // signer facade
  get sign() {
    return this.signer.sign;
  }
  get seal() {
    return this.signer.seal;
  }
  get verify() {
    return this.signer.verify;
  }
  get open() {
    return this.signer.open;
  }
}
Spark.availableChannels = [];
