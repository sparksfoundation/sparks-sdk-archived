import util from "tweetnacl-util";
import { CoreCipher } from "../CoreCipher.mjs";
import { X25519SalsaPoly } from "./X25519SalsaPoly.mjs";
import nacl from "tweetnacl";
import * as scrypt from "scrypt-pbkdf";
import { CipherErrors } from "../../errors/cipher.mjs";
export class X25519SalsaPolyPassword extends CoreCipher {
  constructor() {
    super();
    this.X25519SalsaPoly = new X25519SalsaPoly();
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
      const keyPair = nacl.box.keyPair.fromSecretKey(uint8Seed);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      return { publicKey: util.encodeBase64(keyPair.publicKey), secretKey, salt };
    } catch (error) {
      return Promise.reject(CipherErrors.GenerateCipherKeyPairError(error));
    }
  }
  getPublicKey() {
    return this.X25519SalsaPoly.getPublicKey();
  }
  getSecretKey() {
    return this.X25519SalsaPoly.getSecretKey();
  }
  getKeyPair() {
    const keyPair = this.X25519SalsaPoly.getKeyPair();
    return { ...keyPair, salt: this._salt };
  }
  setKeyPair({ publicKey, secretKey, salt }) {
    this._salt = salt;
    this.X25519SalsaPoly.setKeyPair({ publicKey, secretKey });
  }
  async decrypt(params) {
    return this.X25519SalsaPoly.decrypt(params);
  }
  async encrypt(params) {
    return this.X25519SalsaPoly.encrypt(params);
  }
  async generateSharedKey(params) {
    return this.X25519SalsaPoly.generateSharedKey(params);
  }
}
