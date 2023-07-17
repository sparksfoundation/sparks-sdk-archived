"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ed25519Password = void 0;
var scrypt = _interopRequireWildcard(require("scrypt-pbkdf"));
var _Ed = require("./Ed25519.cjs");
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var _tweetnaclUtil = _interopRequireDefault(require("tweetnacl-util"));
var _CoreSigner = require("../CoreSigner.cjs");
var _signer = require("../../errors/signer.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
class Ed25519Password extends _CoreSigner.CoreSigner {
  constructor() {
    super();
    this.Ed25519 = new _Ed.Ed25519();
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
  async generateKeyPair({
    password,
    salt: nonce
  }) {
    try {
      const options = {
        N: 16384,
        r: 8,
        p: 1
      };
      const salt = nonce || _tweetnaclUtil.default.encodeBase64(_tweetnacl.default.randomBytes(16));
      const len = _tweetnacl.default.box.secretKeyLength / 2;
      const buffer = await scrypt.scrypt(password, salt, len, options);
      const seed = [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, "0")).join("");
      const uint8Seed = _tweetnaclUtil.default.decodeUTF8(seed);
      const keyPair = _tweetnacl.default.sign.keyPair.fromSeed(uint8Seed);
      const secretKey = _tweetnaclUtil.default.encodeBase64(keyPair.secretKey);
      return {
        publicKey: _tweetnaclUtil.default.encodeBase64(keyPair.publicKey),
        secretKey,
        salt
      };
    } catch (error) {
      return Promise.reject(_signer.SignerErrors.GenerateSignerKeyPairError(error));
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
    return {
      ...keyPair,
      salt: this._salt
    };
  }
  setKeyPair({
    publicKey,
    secretKey,
    salt
  }) {
    this._salt = salt;
    this.Ed25519.setKeyPair({
      publicKey,
      secretKey
    });
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
exports.Ed25519Password = Ed25519Password;