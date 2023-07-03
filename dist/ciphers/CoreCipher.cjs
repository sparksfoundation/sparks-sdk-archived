"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreCipher = void 0;
var _cipher = require("../errors/cipher.cjs");
class CoreCipher {
  constructor() {
    this.getPublicKey = this.getPublicKey.bind(this);
    this.getSecretKey = this.getSecretKey.bind(this);
    this.getKeyPair = this.getKeyPair.bind(this);
    this.setKeyPair = this.setKeyPair.bind(this);
    this.generateKeyPair = this.generateKeyPair.bind(this);
    this.generateSharedKey = this.generateSharedKey.bind(this);
    this.encrypt = this.encrypt.bind(this);
    this.decrypt = this.decrypt.bind(this);
  }
  async import(data) {
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({});
  }
  getPublicKey() {
    try {
      if (!this._publicKey) throw new Error("No public key found.");
      return this._publicKey;
    } catch (error) {
      throw _cipher.CipherErrors.GetCipherPublicKeyError(error);
    }
  }
  getSecretKey() {
    try {
      if (!this._secretKey) throw new Error("No secret key found.");
      return this._secretKey;
    } catch (error) {
      throw _cipher.CipherErrors.GetCipherSecretKeyError(error);
    }
  }
  getKeyPair() {
    try {
      const publicKey = this.getPublicKey();
      const secretKey = this.getSecretKey();
      if (!publicKey || !secretKey) throw new Error("No key pair found.");
      return {
        publicKey,
        secretKey
      };
    } catch (error) {
      throw _cipher.CipherErrors.GetEncryptionKeypairError(error);
    }
  }
  setKeyPair({
    publicKey,
    secretKey
  }) {
    try {
      if (!publicKey) throw new Error("No public key found.");
      if (!secretKey) throw new Error("No secret key found.");
      this._publicKey = publicKey;
      this._secretKey = secretKey;
    } catch (error) {
      throw _cipher.CipherErrors.SetEncryptionKeypairError(error);
    }
  }
}
exports.CoreCipher = CoreCipher;