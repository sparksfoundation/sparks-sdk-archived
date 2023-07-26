// src/ciphers/X25519SalsaPolyPassword/index.ts
import util3 from "tweetnacl-util";

// src/ciphers/X25519SalsaPoly/index.ts
import nacl2 from "tweetnacl";
import util2 from "tweetnacl-util";

// src/utilities/index.ts
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { createId, isCuid } from "@paralleldrive/cuid2";
function utcEpochTimestamp() {
  const now = /* @__PURE__ */ new Date();
  return now.getTime() + now.getTimezoneOffset() * 60 * 1e3;
}
function parseJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}
function randomCuid() {
  return createId();
}

// src/events/SparkEvent/index.ts
var SparkEvent = class {
  type;
  timestamp;
  metadata;
  data;
  digest;
  constructor(args) {
    this.type = args.type;
    this.metadata = args.metadata;
    this.timestamp = args.timestamp;
    if (args.data)
      this.data = args.data;
    if (args.digest)
      this.digest = args.digest;
  }
};
var createEvent = (params) => {
  const { type, data, digest } = params;
  const timestamp = utcEpochTimestamp();
  const metadata = { ...params.metadata || {}, eventId: randomCuid() };
  const invalidEvent = !type.endsWith("_REQUEST") && !type.endsWith("_CONFIRM") && !type.endsWith("_ERROR");
  const invalidParams = !!(data && digest || !data && !digest);
  let event;
  if (!!data)
    event = new SparkEvent({ type, metadata, timestamp, data });
  else if (!!digest)
    event = new SparkEvent({ type, metadata, timestamp, digest });
  else
    event = null;
  if (invalidEvent || invalidParams || !event) {
    throw new SparkEvent({
      type: "CREATE_EVENT_ERROR",
      metadata: {
        eventId: randomCuid()
      },
      timestamp,
      data: { message: invalidEvent ? `Invalid event type: ${type}` : `Invalid event params: ${JSON.stringify(params)}` }
    });
  }
  const isError = event.type.endsWith("_ERROR");
  return event;
};

// src/errors/ciphers.ts
var CipherErrorTypes = {
  CIPHER_PUBLICKEY_ERROR: "CIPHER_PUBLICKEY_ERROR",
  CIPHER_SECRETKEY_ERROR: "CIPHER_SECRETKEY_ERROR",
  CIPHER_KEYPAIR_ERROR: "CIPHER_KEYPAIR_ERROR",
  CIPHER_ENCRYPTION_ERROR: "CIPHER_ENCRYPTION_ERROR",
  CIPHER_DECRYPTION_ERROR: "CIPHER_DECRYPTION_ERROR",
  CIPHER_SHARED_KEY_ERROR: "CIPHER_SHARED_KEY_ERROR",
  CIPHER_UNEXPECTED_ERROR: "CIPHER_UNEXPECTED_ERROR"
};
var CipherErrors = {
  CIPHER_PUBLICKEY_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_PUBLICKEY_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to generate public key." }
  }),
  CIPHER_SECRETKEY_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_SECRETKEY_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to generate secret key." }
  }),
  CIPHER_KEYPAIR_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_KEYPAIR_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to generate key pair." }
  }),
  CIPHER_ENCRYPTION_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_ENCRYPTION_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to encrypt data." }
  }),
  CIPHER_DECRYPTION_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_DECRYPTION_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to decrypt data." }
  }),
  CIPHER_SHARED_KEY_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_SHARED_KEY_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to generate shared key." }
  }),
  CIPHER_UNEXPECTED_ERROR: ({ metadata = {}, message } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || "Unexpected cipher error." }
  })
};

// src/ciphers/SparkCipher/index.ts
var SparkCipher = class {
  algorithm;
  _publicKey;
  _secretKey;
  constructor({ algorithm }) {
    this.algorithm = algorithm;
    this.setKeyPair = this.setKeyPair.bind(this);
    this.generateKeyPair = this.generateKeyPair.bind(this);
    this.generateSharedKey = this.generateSharedKey.bind(this);
    this.encrypt = this.encrypt.bind(this);
    this.decrypt = this.decrypt.bind(this);
  }
  get publicKey() {
    return this._publicKey;
  }
  get secretKey() {
    return this._secretKey;
  }
  get keyPair() {
    const publicKey = this.publicKey;
    const secretKey = this.secretKey;
    return { publicKey, secretKey };
  }
  async import(data) {
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({});
  }
  setKeyPair({ publicKey, secretKey }) {
    if (!publicKey)
      throw CipherErrors.CIPHER_PUBLICKEY_ERROR();
    if (!secretKey)
      throw CipherErrors.CIPHER_SECRETKEY_ERROR();
    this._publicKey = publicKey;
    this._secretKey = secretKey;
  }
};

// src/ciphers/X25519SalsaPoly/index.ts
var X25519SalsaPoly = class extends SparkCipher {
  constructor() {
    super({
      algorithm: "x25519-salsa20-poly1305"
    });
  }
  async import(data) {
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export() || {};
    return Promise.resolve(data);
  }
  async generateKeyPair(params) {
    try {
      const keyPair = params?.secretKey ? nacl2.box.keyPair.fromSecretKey(util2.decodeBase64(params?.secretKey)) : nacl2.box.keyPair();
      if (!keyPair)
        throw CipherErrors.CIPHER_KEYPAIR_ERROR();
      const publicKey = util2.encodeBase64(keyPair.publicKey);
      const secretKey = util2.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey)
        throw CipherErrors.CIPHER_KEYPAIR_ERROR();
      return Promise.resolve({ publicKey, secretKey });
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(CipherErrors.CIPHER_UNEXPECTED_ERROR({
        message: `Failed to generate key pair. ${error?.message || ""}`
      }));
    }
  }
  async generateSharedKey({ publicKey }) {
    try {
      const baseCipherPublicKey = util2.decodeBase64(publicKey);
      const baseCipherSecretKey = util2.decodeBase64(this.secretKey);
      const uintSharedKey = nacl2.box.before(baseCipherPublicKey, baseCipherSecretKey);
      const baseSharedKey = util2.encodeBase64(uintSharedKey);
      if (!baseSharedKey)
        throw CipherErrors.CIPHER_KEYPAIR_ERROR();
      return Promise.resolve(baseSharedKey);
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(CipherErrors.CIPHER_UNEXPECTED_ERROR({
        message: `Failed to generate shared key. ${error?.message || ""}`
      }));
    }
  }
  async encrypt({ data, publicKey, sharedKey }) {
    try {
      let box;
      const utfData = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = util2.decodeUTF8(utfData);
      const nonce = nacl2.randomBytes(nacl2.box.nonceLength);
      if (typeof publicKey === "string") {
        const publicKeyUint = util2.decodeBase64(publicKey);
        box = nacl2.box(uintData, nonce, publicKeyUint, util2.decodeBase64(this.secretKey));
      } else if (typeof sharedKey === "string") {
        const sharedKeyUint = util2.decodeBase64(sharedKey);
        box = nacl2.box.after(uintData, nonce, sharedKeyUint);
      } else {
        const secreKeyUint = util2.decodeBase64(this.secretKey);
        box = nacl2.secretbox(uintData, nonce, secreKeyUint);
      }
      const encrypted = new Uint8Array(nonce.length + box.length);
      if (!encrypted)
        throw CipherErrors.CIPHER_ENCRYPTION_ERROR();
      encrypted.set(nonce);
      encrypted.set(box, nonce.length);
      const ciphertext = util2.encodeBase64(encrypted);
      if (!ciphertext)
        throw CipherErrors.CIPHER_ENCRYPTION_ERROR();
      return Promise.resolve(ciphertext);
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(CipherErrors.CIPHER_UNEXPECTED_ERROR({
        message: `Failed to encrypt data. ${error?.message || ""}`
      }));
    }
  }
  async decrypt({ data, publicKey, sharedKey }) {
    try {
      const uintDataAndNonce = util2.decodeBase64(data);
      const nonce = uintDataAndNonce.slice(0, nacl2.secretbox.nonceLength);
      const uintData = uintDataAndNonce.slice(nacl2.secretbox.nonceLength, uintDataAndNonce.length);
      let decrypted;
      if (typeof publicKey === "string") {
        const publicKeyUint = util2.decodeBase64(publicKey);
        decrypted = nacl2.box.open(uintData, nonce, publicKeyUint, util2.decodeBase64(this.secretKey));
      } else if (typeof sharedKey === "string") {
        const sharedKeyUint = util2.decodeBase64(sharedKey);
        decrypted = nacl2.box.open.after(uintData, nonce, sharedKeyUint);
      } else {
        const secreKeyUint = util2.decodeBase64(this.secretKey);
        decrypted = nacl2.secretbox.open(uintData, nonce, secreKeyUint);
      }
      if (!(decrypted instanceof Uint8Array)) {
        throw CipherErrors.CIPHER_DECRYPTION_ERROR();
      }
      const utf8Result = util2.encodeUTF8(decrypted);
      const parsed = parseJSON(utf8Result) || utf8Result;
      if (!parsed || !utf8Result)
        throw CipherErrors.CIPHER_DECRYPTION_ERROR();
      return Promise.resolve(parsed);
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(CipherErrors.CIPHER_UNEXPECTED_ERROR({
        message: `Failed to decrypt data. ${error?.message || ""}`
      }));
    }
  }
};

// src/ciphers/X25519SalsaPolyPassword/index.ts
import nacl3 from "tweetnacl";
import * as scrypt from "scrypt-pbkdf";
var X25519SalsaPolyPassword = class extends SparkCipher {
  _X25519SalsaPoly;
  _salt;
  constructor() {
    super({
      algorithm: "x25519-salsa20-poly1305"
    });
    this._X25519SalsaPoly = new X25519SalsaPoly();
  }
  get salt() {
    return this._salt;
  }
  get publicKey() {
    return this._X25519SalsaPoly.publicKey;
  }
  get secretKey() {
    return this._X25519SalsaPoly.secretKey;
  }
  get keyPair() {
    const keyPair = this._X25519SalsaPoly.keyPair;
    return { ...keyPair, salt: this._salt };
  }
  async import(data) {
    if (data?.salt)
      this._salt = data.salt;
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    data.salt = this._salt;
    return Promise.resolve(data);
  }
  async generateSharedKey(params) {
    const sharedKey = await this._X25519SalsaPoly.generateSharedKey(params);
    if (!sharedKey)
      throw CipherErrors.CIPHER_SHARED_KEY_ERROR();
    return sharedKey;
  }
  async generateKeyPair({ password, salt: nonce }) {
    try {
      const options = { N: 16384, r: 8, p: 1 };
      const salt = nonce || util3.encodeBase64(nacl3.randomBytes(16));
      const len = nacl3.box.secretKeyLength / 2;
      const buffer = await scrypt.scrypt(password, salt, len, options);
      const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
      const uint8Seed = util3.decodeUTF8(seed);
      const keyPair = nacl3.box.keyPair.fromSecretKey(uint8Seed);
      const secretKey = util3.encodeBase64(keyPair.secretKey);
      const publicKey = util3.encodeBase64(keyPair.publicKey);
      if (!secretKey || !publicKey || !salt) {
        throw CipherErrors.CIPHER_KEYPAIR_ERROR();
      }
      return { publicKey, secretKey, salt };
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(CipherErrors.CIPHER_UNEXPECTED_ERROR({
        message: `Failed to generate key pair. ${error?.message || ""}`
      }));
    }
  }
  setKeyPair({ publicKey, secretKey, salt }) {
    this._salt = salt;
    if (!salt)
      throw CipherErrors.CIPHER_KEYPAIR_ERROR();
    this._X25519SalsaPoly.setKeyPair({ publicKey, secretKey });
  }
  async decrypt(params) {
    return this._X25519SalsaPoly.decrypt(params);
  }
  async encrypt(params) {
    return this._X25519SalsaPoly.encrypt(params);
  }
};
export {
  X25519SalsaPolyPassword
};
//# sourceMappingURL=index.js.map