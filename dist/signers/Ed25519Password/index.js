// src/signers/Ed25519Password/index.ts
import * as scrypt from "scrypt-pbkdf";

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

// src/errors/signers.ts
var SignerErrorTypes = {
  SIGNER_PUBLICKEY_ERROR: "SIGNER_PUBLICKEY_ERROR",
  SIGNER_SECRETKEY_ERROR: "SIGNER_SECRETKEY_ERROR",
  SIGNER_KEYPAIR_ERROR: "SIGNER_KEYPAIR_ERROR",
  SIGNER_SEAL_ERROR: "SIGNER_SEAL_ERROR",
  SIGNER_SIGNATURE_ERROR: "SIGNER_SIGNATURE_ERROR",
  SIGNER_SIGNING_ERROR: "SIGNER_SIGNING_ERROR",
  SIGNER_VERIFY_SIGNATURE_ERROR: "SIGNER_VERIFY_SIGNATURE_ERROR",
  SIGNER_OPEN_SEAL_ERROR: "SIGNER_OPEN_SEAL_ERROR",
  SIGNER_INVALID_SALT_ERROR: "SIGNER_INVALID_SALT_ERROR",
  SIGNER_UNEXPECTED_ERROR: "SIGNER_UNEXPECTED_ERROR"
};
var SignerErrors = {
  SIGNER_PUBLICKEY_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_PUBLICKEY_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to generate public key." }
  }),
  SIGNER_SECRETKEY_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_SECRETKEY_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to generate secret key." }
  }),
  SIGNER_KEYPAIR_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_KEYPAIR_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to generate key pair." }
  }),
  SIGNER_SEAL_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_SEAL_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to seal data." }
  }),
  SIGNER_SIGNATURE_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_SIGNATURE_ERROR,
    metadata: { ...metadata },
    data: { message: "Invalid signature." }
  }),
  SIGNER_SIGNING_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_SIGNING_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to sign data." }
  }),
  SIGNER_INVALID_SALT_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_INVALID_SALT_ERROR,
    metadata: { ...metadata },
    data: { message: "Missing password salt." }
  }),
  SIGNER_OPEN_SEAL_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_OPEN_SEAL_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to open seal." }
  }),
  SIGNER_VERIFY_SIGNATURE_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_VERIFY_SIGNATURE_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to verify signature." }
  }),
  SIGNER_UNEXPECTED_ERROR: ({ metadata = {}, message } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || "Unexpected signer error." }
  })
};

// src/signers/SparkSigner/index.ts
var SparkSigner = class {
  _publicKey;
  _secretKey;
  constructor() {
    this.setKeyPair = this.setKeyPair.bind(this);
    this.generateKeyPair = this.generateKeyPair.bind(this);
    this.sign = this.sign.bind(this);
    this.verify = this.verify.bind(this);
    this.seal = this.seal.bind(this);
    this.open = this.open.bind(this);
  }
  get publicKey() {
    return this._publicKey;
  }
  get secretKey() {
    return this._secretKey;
  }
  get keyPair() {
    return {
      publicKey: this.publicKey,
      secretKey: this.secretKey
    };
  }
  async import(data) {
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({});
  }
  setKeyPair({ publicKey, secretKey }) {
    try {
      if (!publicKey)
        throw SignerErrors.SIGNER_PUBLICKEY_ERROR();
      if (!secretKey)
        throw SignerErrors.SIGNER_SECRETKEY_ERROR();
      this._publicKey = publicKey;
      this._secretKey = secretKey;
    } catch (error) {
      if (error instanceof Error)
        throw error;
      throw SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to set key pair. ${error?.message || ""}`
      });
    }
  }
};

// src/signers/Ed25519/index.ts
import nacl2 from "tweetnacl";
import util2 from "tweetnacl-util";
var Ed25519 = class extends SparkSigner {
  async import(data) {
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    return Promise.resolve(data);
  }
  async generateKeyPair(params) {
    try {
      const keyPair = params?.secretKey ? nacl2.sign.keyPair.fromSecretKey(util2.decodeBase64(params?.secretKey)) : nacl2.sign.keyPair();
      const publicKey = util2.encodeBase64(keyPair.publicKey);
      const secretKey = util2.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey)
        throw SignerErrors.SIGNER_KEYPAIR_ERROR();
      return { publicKey, secretKey };
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to generate key pair. ${error?.message || ""}`
      }));
    }
  }
  async seal({ data }) {
    try {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = util2.decodeUTF8(dataString);
      const uintSecretKey = util2.decodeBase64(this._secretKey);
      const signature = util2.encodeBase64(nacl2.sign(uintData, uintSecretKey));
      if (!signature)
        throw SignerErrors.SIGNER_SEAL_ERROR();
      return signature;
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to seal data. ${error?.message || ""}`
      }));
    }
  }
  async open({ publicKey, signature }) {
    try {
      const uintSignature = util2.decodeBase64(signature);
      const uintPublicKey = util2.decodeBase64(publicKey);
      const uintResult = nacl2.sign.open(uintSignature, uintPublicKey);
      if (!uintResult)
        throw SignerErrors.SIGNER_OPEN_SEAL_ERROR();
      const utf8Result = util2.encodeUTF8(uintResult);
      const data = parseJSON(utf8Result) || utf8Result;
      if (!data)
        throw SignerErrors.SIGNER_OPEN_SEAL_ERROR();
      return data;
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to open data. ${error?.message || ""}`
      }));
    }
  }
  async sign({ data }) {
    try {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = util2.decodeUTF8(dataString);
      const uintSecretKey = util2.decodeBase64(this._secretKey);
      const signature = util2.encodeBase64(nacl2.sign.detached(uintData, uintSecretKey));
      if (!signature)
        throw SignerErrors.SIGNER_SIGNING_ERROR();
      return signature;
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to sign data. ${error?.message || ""}`
      }));
    }
  }
  async verify({ publicKey, signature, data }) {
    try {
      if (!data)
        throw new Error("Missing data to verify signature.");
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      const uintData = util2.decodeUTF8(dataString);
      const uintSignature = util2.decodeBase64(signature);
      const uintPublicKey = util2.decodeBase64(publicKey);
      const verified = nacl2.sign.detached.verify(uintData, uintSignature, uintPublicKey);
      return verified;
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to verify signature. ${error?.message || ""}`
      }));
    }
  }
};

// src/signers/Ed25519Password/index.ts
import nacl3 from "tweetnacl";
import util3 from "tweetnacl-util";
var Ed25519Password = class extends SparkSigner {
  Ed25519;
  _salt;
  constructor() {
    super();
    this.Ed25519 = new Ed25519();
  }
  get salt() {
    return this._salt;
  }
  async import(data) {
    this._salt = data.salt;
    if (!data.salt)
      throw SignerErrors.SIGNER_INVALID_SALT_ERROR();
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    data.salt = this._salt;
    if (!data.salt)
      throw SignerErrors.SIGNER_INVALID_SALT_ERROR();
    return Promise.resolve(data);
  }
  async generateKeyPair({ password, salt: nonce }) {
    try {
      const options = { N: 16384, r: 8, p: 1 };
      const salt = nonce || util3.encodeBase64(nacl3.randomBytes(16));
      const len = nacl3.box.secretKeyLength / 2;
      const buffer = await scrypt.scrypt(password, salt, len, options);
      const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
      const uint8Seed = util3.decodeUTF8(seed);
      const keyPair = nacl3.sign.keyPair.fromSeed(uint8Seed);
      const secretKey = util3.encodeBase64(keyPair.secretKey);
      const publicKey = util3.encodeBase64(keyPair.publicKey);
      if (!publicKey || !secretKey)
        throw SignerErrors.SIGNER_KEYPAIR_ERROR();
      return { publicKey, secretKey, salt };
    } catch (error) {
      if (error instanceof SparkSigner)
        return Promise.reject(error);
      return Promise.reject(SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to generate key pair. ${error?.message || ""}`
      }));
    }
  }
  get publicKey() {
    return this.Ed25519.publicKey;
  }
  get secretKey() {
    return this.Ed25519.secretKey;
  }
  get keyPair() {
    const keyPair = this.Ed25519.keyPair;
    return { ...keyPair, salt: this._salt };
  }
  setKeyPair({ publicKey, secretKey, salt }) {
    if (!salt)
      throw SignerErrors.SIGNER_INVALID_SALT_ERROR();
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
};
export {
  Ed25519Password
};
//# sourceMappingURL=index.js.map