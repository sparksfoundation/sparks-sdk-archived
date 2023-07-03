import { SignerErrors } from "../errors/signer.mjs";
export class CoreSigner {
  constructor() {
    this.getPublicKey = this.getPublicKey.bind(this);
    this.getSecretKey = this.getSecretKey.bind(this);
    this.getKeyPair = this.getKeyPair.bind(this);
    this.setKeyPair = this.setKeyPair.bind(this);
    this.generateKeyPair = this.generateKeyPair.bind(this);
    this.sign = this.sign.bind(this);
    this.verify = this.verify.bind(this);
    this.seal = this.seal.bind(this);
    this.open = this.open.bind(this);
  }
  async import(data) {
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({});
  }
  getPublicKey() {
    try {
      if (!this._publicKey)
        throw new Error("No public key found.");
      return this._publicKey;
    } catch (error) {
      throw SignerErrors.GetSignerPublicKeyError(error);
    }
  }
  getSecretKey() {
    try {
      if (!this._secretKey)
        throw new Error("No secret key found.");
      return this._secretKey;
    } catch (error) {
      throw SignerErrors.GetSignerSecretKeyError(error);
    }
  }
  getKeyPair() {
    try {
      const publicKey = this.getPublicKey();
      if (!publicKey)
        throw new Error("No public key found.");
      const secretKey = this.getSecretKey();
      if (!secretKey)
        throw new Error("No secret key found.");
      return { publicKey, secretKey };
    } catch (error) {
      throw SignerErrors.GetSignerKeyPairError(error);
    }
  }
  setKeyPair({ publicKey, secretKey }) {
    try {
      if (!publicKey)
        throw new Error("No public key found.");
      if (!secretKey)
        throw new Error("No secret key found.");
      this._publicKey = publicKey;
      this._secretKey = secretKey;
    } catch (error) {
      throw SignerErrors.SetSignerKeyPairError(error);
    }
  }
}
