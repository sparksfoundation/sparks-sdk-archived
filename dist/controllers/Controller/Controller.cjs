"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = void 0;
var _types = require("./types.cjs");
class Controller {
  constructor(spark) {
    if (!spark) throw new Error("Channel: missing spark");
    this.spark = spark;
    Object.defineProperties(this, {
      spark: {
        enumerable: false,
        writable: false
      }
    });
    this._keyEventLog = [];
  }
  get identifier() {
    return this._identifier;
  }
  get keyEventLog() {
    return this._keyEventLog;
  }
  get keyPairs() {
    return this._keyPairs;
  }
  get encryptionKeys() {
    return {
      publicKey: this._keyPairs.encryption.publicKey,
      secretKey: this._keyPairs.encryption.secretKey
    };
  }
  get signingKeys() {
    return {
      publicKey: this._keyPairs.signing.publicKey,
      secretKey: this._keyPairs.signing.secretKey
    };
  }
  get secretKeys() {
    return {
      signing: this._keyPairs.signing.secretKey,
      encryption: this._keyPairs.encryption.secretKey
    };
  }
  get publicKeys() {
    return {
      signing: this._keyPairs.signing.publicKey,
      encryption: this._keyPairs.encryption.publicKey
    };
  }
  async incept(args) {
    const {
      keyPairs,
      nextKeyPairs,
      backers = []
    } = args || {};
    this._keyPairs = keyPairs;
    const inceptionEvent = await this.keyEvent({
      keyPairs,
      nextKeyPairs,
      eventType: _types.KeriEventType.INCEPTION,
      backers: [...backers]
    });
    if (!inceptionEvent) {
      this._keyPairs = void 0;
      throw new Error("Inception failed");
    }
    const {
      identifier
    } = inceptionEvent;
    this._identifier = identifier;
    this._keyPairs = keyPairs;
    this._keyEventLog.push(inceptionEvent);
  }
  async rotate(args) {
    const {
      keyPairs,
      nextKeyPairs,
      backers = []
    } = args;
    const rotationEvent = await this.keyEvent({
      keyPairs,
      nextKeyPairs,
      eventType: _types.KeriEventType.ROTATION,
      backers: [...backers]
    });
    if (!rotationEvent) throw new Error("Rotation failed");
    this._keyPairs = keyPairs;
    this._keyEventLog.push(rotationEvent);
  }
  async delete(args) {
    const {
      backers = []
    } = args || {};
    const deletionEvent = await this.keyEvent({
      eventType: _types.KeriEventType.DELETION,
      backers: [...backers]
    });
    if (!deletionEvent) throw new Error("Deletion failed");
    this._keyPairs = {
      signing: {
        publicKey: "",
        secretKey: ""
      },
      encryption: {
        publicKey: "",
        secretKey: ""
      }
    };
    this._keyEventLog.push(deletionEvent);
  }
  async keyEvent(args) {
    const {
      eventType,
      backers = []
    } = args || {};
    const {
      keyPairs,
      nextKeyPairs
    } = args || {};
    const lastEvent = this._keyEventLog[this._keyEventLog.length - 1];
    const keyHash = keyPairs ? await this.spark.hash(keyPairs.signing.publicKey) : null;
    const hasKeyPairs = !!keyPairs && !!nextKeyPairs;
    const isIncepted = !!this.identifier || !!this._keyEventLog?.length;
    const isDeleted = lastEvent?.eventType === _types.KeriEventType.DELETION;
    const isValidCommit = keyHash === lastEvent?.nextKeyCommitments[0];
    if (eventType === _types.KeriEventType.INCEPTION) {
      if (isIncepted) throw new Error("Identity already incepted");
      if (!hasKeyPairs) throw new Error("current and next key pairs required for inception");
    } else if (eventType === _types.KeriEventType.ROTATION) {
      if (!isIncepted) throw Error("Keys can not be rotated before inception");
      if (!hasKeyPairs) throw new Error("current and next key pairs required for rotation");
      if (isDeleted) throw new Error("Keys can not be rotated after destruction");
      if (!isValidCommit) throw new Error("Key commitment does not match the current key commitment");
    } else if (eventType === _types.KeriEventType.DELETION) {
      if (isDeleted) throw new Error("Identity has already been deleted");
    }
    const eventIndex = this._keyEventLog.length;
    const nextKeyCommitments = eventType === _types.KeriEventType.DELETION ? [] : [await this.spark.hash(nextKeyPairs.signing.publicKey)];
    const signingKeys = eventType === _types.KeriEventType.DELETION ? [] : [keyPairs.signing.publicKey];
    const event = {
      eventIndex,
      eventType,
      signingThreshold: 1,
      signingKeys,
      nextKeyCommitments,
      backerThreshold: 1,
      backers
    };
    const eventJSON = JSON.stringify(event);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = await this.spark.hash(eventJSON);
    const signedEventHash = await this.spark.sign({
      data: hashedEvent,
      detached: true
    });
    const identifier = this.identifier || `B${signedEventHash}`;
    if (eventType === _types.KeriEventType.ROTATION) {
      const previousEventDigest = this._keyEventLog[this._keyEventLog.length - 1].selfAddressingIdentifier;
      if (!previousEventDigest) throw new Error("Previous event digest not found");
      event.previousEventDigest = previousEventDigest;
    }
    const keyEvent = {
      ...event,
      identifier,
      selfAddressingIdentifier: signedEventHash,
      version
    };
    return keyEvent;
  }
  // todo - some thinking around how to handle import and export given dynamic agents
  async import({
    keyPairs,
    data
  }) {
    this._keyPairs = keyPairs;
    const decrypted = await this.spark.decrypt({
      data
    });
    const deepCopy = JSON.parse(JSON.stringify(decrypted));
    delete deepCopy.postMessage;
    Object.assign(this, deepCopy);
  }
  async export(args) {
    const {
      _keyPairs,
      ...data
    } = this;
    const encrypted = await this.spark.encrypt({
      data: JSON.stringify(data)
    });
    return encrypted;
  }
}
exports.Controller = Controller;