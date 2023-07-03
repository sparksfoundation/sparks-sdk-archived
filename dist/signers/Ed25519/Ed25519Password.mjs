import * as scrypt from "scrypt-pbkdf";
import { Ed25519 } from "./Ed25519.mjs";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { CoreSigner } from "../CoreSigner.mjs";
import { SignerErrors } from "../../errors/signer.mjs";
export class Ed25519Password extends CoreSigner {
  constructor() {
    super();
    this.Ed25519 = new Ed25519();
  }
  get salt() {
    return this._salt;
  }
  async import(data) {
    this._salt = data.salt;
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    data.salt = this._salt;
    return Promise.resolve(data);
  }
  async generateKeyPair({ password, salt: nonce }) {
    try {
      const options = { N: 16384, r: 8, p: 1 };
      const salt = nonce || util.encodeBase64(nacl.randomBytes(16));
      const len = nacl.box.secretKeyLength / 2;
      const buffer = await scrypt.scrypt(password, salt, len, options);
      const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
      const uint8Seed = util.decodeUTF8(seed);
      const keyPair = nacl.sign.keyPair.fromSeed(uint8Seed);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      return { publicKey: util.encodeBase64(keyPair.publicKey), secretKey, salt };
    } catch (error) {
      return Promise.reject(SignerErrors.GenerateSignerKeyPairError(error));
    }
  }
  getPublicKey() {
    return this.Ed25519.getPublicKey();
  }
  getSecretKey() {
    return this.Ed25519.getSecretKey();
  }
  getKeyPair() {
    const keyPair = this.Ed25519.getKeyPair();
    return { ...keyPair, salt: this._salt };
  }
  setKeyPair({ publicKey, secretKey, salt }) {
    this._salt = salt;
    this.Ed25519.setKeyPair({ publicKey, secretKey });
  }
  async sign(args) {
    return this.Ed25519.sign(args);
  }
  async verify(args) {
    return this.Ed25519.verify(args);
  }
  async seal(args) {
    return this.Ed25519.seal(args);
  }
  async open(args) {
    return this.Ed25519.open(args);
  }
}
