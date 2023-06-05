'use strict';

var util = require('tweetnacl-util');
var blake3 = require('@noble/hashes/blake3');
var nacl = require('tweetnacl');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var util__default = /*#__PURE__*/_interopDefault(util);
var nacl__default = /*#__PURE__*/_interopDefault(nacl);

class Identity {
  #keyPairs;
  #identifier;
  #keyEventLog;
  #connections = [];
  // convenience to return null if not valid
  __parseJSON(string) {
    if (typeof string !== "string")
      return null;
    try {
      return JSON.parse(string);
    } catch (e) {
      return null;
    }
  }
  constructor() {
  }
  get connections() {
    return this.#connections;
  }
  get identifier() {
    return this.#identifier;
  }
  get keyEventLog() {
    return this.#keyEventLog;
  }
  get publicKeys() {
    return {
      signing: this.#keyPairs.signing.publicKey,
      encryption: this.#keyPairs.encryption.publicKey
    };
  }
  incept({ keyPairs, nextKeyPairs, backers = [] }) {
    var _a;
    if (this.#identifier || ((_a = this.#keyEventLog) == null ? void 0 : _a.length)) {
      throw Error("Identity already incepted");
    }
    if (!keyPairs) {
      throw new Error("Key pairs required for inception");
    }
    if (!nextKeyPairs) {
      throw new Error("Next signing key commitment required for inception");
    }
    this.#keyPairs = keyPairs;
    const identifier = `B${this.#keyPairs.signing.publicKey.replace(/=$/, "")}`;
    const publicSigningKey = this.#keyPairs.signing.publicKey;
    const nextKeyHash = util__default.default.encodeBase64(blake3.blake3(util__default.default.decodeBase64(nextKeyPairs.signing.publicKey)));
    const inceptionEvent = {
      identifier,
      // i: AID identifier prefix
      eventIndex: "0",
      // s: sequence number
      eventType: "inception",
      // t: event type
      signingThreshold: "1",
      // kt: minimum amount of signatures needed for this event to be valid (multisig)
      signingKeys: [publicSigningKey],
      // k: list of signing keys
      nextKeyCommitments: [nextKeyHash],
      // n: next keys, added encryption because it makes sense imo
      backerThreshold: "1",
      // bt: minimum amount of witnesses threshold - I think these are called backers now
      backers: [...backers]
      // b: list of witnesses in this case the spark pwa-agent host's publickey there's no receipt at this step
    };
    const eventJSON = JSON.stringify(inceptionEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = util__default.default.encodeBase64(blake3.blake3(eventJSON));
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;
    this.#identifier = identifier;
    this.#keyEventLog = [inceptionEvent];
  }
  rotate({ keyPairs, nextKeyPairs, backers = [] }) {
    var _a;
    if (!this.#identifier || !((_a = this.#keyEventLog) == null ? void 0 : _a.length)) {
      throw Error("Keys can not be rotated before inception");
    }
    if (!keyPairs) {
      throw new Error("Key pairs required for rotation");
    }
    if (!nextKeyPairs) {
      throw new Error("Next signing key committment required for rotation");
    }
    if (this.#keyEventLog[this.#keyEventLog.length - 1].eventType === "destruction") {
      throw new Error("Keys can not be rotated after destruction");
    }
    this.#keyPairs = keyPairs;
    const oldKeyEvent = this.#keyEventLog[this.#keyEventLog.length - 1];
    const publicSigningKey = this.#keyPairs.signing.publicKey;
    const nextKeyHash = util__default.default.encodeBase64(blake3.blake3(util__default.default.decodeBase64(nextKeyPairs.signing.publicKey)));
    const rotationEvent = {
      identifier: this.#identifier,
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: "rotation",
      signingThreshold: oldKeyEvent.signatureThreshold,
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [nextKeyHash],
      backerThreshold: oldKeyEvent.backerThreshold,
      backers: [...backers]
    };
    const eventJSON = JSON.stringify(rotationEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = util__default.default.encodeBase64(blake3.blake3(eventJSON));
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });
    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;
    this.#keyEventLog.push(rotationEvent);
  }
  destroy(args) {
    var _a;
    const { backers = [] } = args || {};
    if (!this.#identifier || !((_a = this.#keyEventLog) == null ? void 0 : _a.length)) {
      throw Error("Identity does not exist");
    }
    const oldKeyEvent = this.#keyEventLog[this.#keyEventLog.length - 1];
    const publicSigningKey = this.#keyPairs.signing.publicKey;
    const rotationEvent = {
      identifier: this.#identifier,
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: "destruction",
      signingThreshold: oldKeyEvent.signingThreshold,
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [],
      backerThreshold: oldKeyEvent.backerThreshold,
      backers: [...backers]
    };
    const eventJSON = JSON.stringify(rotationEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = util__default.default.encodeBase64(blake3.blake3(eventJSON));
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });
    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;
    this.#keyEventLog.push(rotationEvent);
  }
  // todo -- add asymmetric key encryption options
  encrypt({ data, publicKey, sharedKey }) {
    if (!this.#keyPairs) {
      throw new Error("No key pairs found, please import or incept identity");
    }
    const utfData = typeof data === "string" ? data : JSON.stringify(data);
    const uintData = util__default.default.decodeUTF8(utfData);
    const nonce = nacl__default.default.randomBytes(nacl__default.default.box.nonceLength);
    let box;
    if (publicKey) {
      const publicKeyUint = util__default.default.decodeBase64(publicKey);
      box = nacl__default.default.box(uintData, nonce, publicKeyUint, util__default.default.decodeBase64(this.#keyPairs.encryption.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = util__default.default.decodeBase64(sharedKey);
      box = nacl__default.default.box.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = util__default.default.decodeBase64(this.#keyPairs.encryption.secretKey);
      box = nacl__default.default.secretbox(uintData, nonce, secreKeyUint);
    }
    const encrypted = new Uint8Array(nonce.length + box.length);
    encrypted.set(nonce);
    encrypted.set(box, nonce.length);
    return util__default.default.encodeBase64(encrypted);
  }
  decrypt({ data, publicKey, sharedKey }) {
    if (!this.#keyPairs) {
      throw new Error("No key pairs found, please import or incept identity");
    }
    const uintDataAndNonce = util__default.default.decodeBase64(data);
    const nonce = uintDataAndNonce.slice(0, nacl__default.default.secretbox.nonceLength);
    const uintData = uintDataAndNonce.slice(nacl__default.default.secretbox.nonceLength, uintDataAndNonce.length);
    let decrypted;
    if (publicKey) {
      const publicKeyUint = util__default.default.decodeBase64(publicKey);
      decrypted = nacl__default.default.box.open(uintData, nonce, publicKeyUint, util__default.default.decodeBase64(this.#keyPairs.encryption.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = util__default.default.decodeBase64(sharedKey);
      decrypted = nacl__default.default.box.open.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = util__default.default.decodeBase64(this.#keyPairs.encryption.secretKey);
      decrypted = nacl__default.default.secretbox.open(uintData, nonce, secreKeyUint);
    }
    if (!decrypted) {
      throw new Error("Could not decrypt message");
    }
    const utf8Result = util__default.default.encodeUTF8(decrypted);
    const result = this.__parseJSON(utf8Result) || utf8Result;
    return result;
  }
  sign({ data, detached = false }) {
    if (typeof data !== "string") {
      data = this.__parseJSON(data);
    }
    const uintData = util__default.default.decodeUTF8(data);
    const uintSecretKey = util__default.default.decodeBase64(this.#keyPairs.signing.secretKey);
    const signature = detached ? util__default.default.encodeBase64(nacl__default.default.sign.detached(uintData, uintSecretKey)) : util__default.default.encodeBase64(nacl__default.default.sign(uintData, uintSecretKey));
    return signature;
  }
  verify({ publicKey, signature, data }) {
    if (!!data) {
      if (typeof data !== "string") {
        data = util__default.default.decodeUTF8(this.__parseJSON(data));
      }
      data = util__default.default.decodeUTF8(data);
    }
    const uintSignature = util__default.default.decodeBase64(signature);
    const uintPublicKey = util__default.default.decodeBase64(publicKey);
    if (data) {
      return nacl__default.default.sign.detached.verify(data, uintSignature, uintPublicKey);
    } else {
      const uintResult = nacl__default.default.sign.open(uintSignature, uintPublicKey);
      if (uintResult === null)
        return uintResult;
      const utf8Result = util__default.default.encodeUTF8(uintResult);
      return this.__parseJSON(utf8Result) || utf8Result;
    }
  }
  addConnection(Connection) {
    return new Connection({
      keyPairs: this.#keyPairs,
      encrypt: this.encrypt.bind(this),
      decrypt: this.decrypt.bind(this),
      sign: this.sign.bind(this),
      verify: this.verify.bind(this)
    });
  }
  toJSON() {
    return {
      identifier: this.#identifier,
      keyEventLog: this.#keyEventLog
    };
  }
}

exports.Identity = Identity;
