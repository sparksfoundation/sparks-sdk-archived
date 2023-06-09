class BaseIdentity {
  identifier;
  keyPairs;
  keyEventLog;
  constructor() {
    this.keyEventLog = [];
  }
  get publicKeys() {
    var _a, _b;
    const signing = (_a = this.keyPairs.signing) == null ? void 0 : _a.publicKey;
    const encryption = (_b = this.keyPairs.encryption) == null ? void 0 : _b.publicKey;
    if (!signing || !encryption)
      return null;
    return { signing, encryption };
  }
  /**
   * Incept a new identity.
   * @param {object} keyPairs - The key pairs to use for the inception event.
   * @param {object} nextKeyPairs - The next key pairs to use for the next key commitment.
   * @param {string[]} backers - The list of backers to use for the inception event.
   * @throws {Error} If the identity has already been incepted.
   * @throws {Error} If no key pairs are provided.
   * @throws {Error} If no next key pairs are provided.
   * @todo -- add the receipt request and processing
   */
  incept({ keyPairs, nextKeyPairs, backers = [] }) {
    var _a;
    if (this.identifier || ((_a = this.keyEventLog) == null ? void 0 : _a.length)) {
      throw Error("Identity already incepted");
    }
    if (!keyPairs) {
      throw new Error("Key pairs required for inception");
    }
    if (!nextKeyPairs) {
      throw new Error("Next signing key commitment required for inception");
    }
    this.keyPairs = keyPairs;
    const identifier = `B${this.keyPairs.signing.publicKey.replace(/=$/, "")}`;
    const publicSigningKey = this.keyPairs.signing.publicKey;
    const nextKeyHash = this.hash(nextKeyPairs.signing.publicKey);
    const event = {
      identifier,
      eventIndex: "0",
      eventType: "inception",
      signingThreshold: "1",
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [nextKeyHash],
      backerThreshold: "1",
      backers: [...backers]
    };
    const eventJSON = JSON.stringify(event);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = this.hash(eventJSON);
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });
    const inceptionEvent = {
      ...event,
      previousEventDigest: null,
      selfAddressingIdentifier: signedEventHash,
      version
    };
    this.identifier = inceptionEvent.identifier;
    this.keyEventLog = [inceptionEvent];
  }
  /**
   * Rotate the keys of an identity.
   * @param {object} keyPairs - The key pairs to use for the rotation event.
   * @param {object} nextKeyPairs - The next key pairs to use for the next key commitment.
   * @param {string[]} backers - The list of backers to use for the rotation event.
   * @returns {object} The rotation event.
   * @throws {Error} If the identity has not been incepted.
   * @throws {Error} If no key pairs are provided.
   * @throws {Error} If no next key pairs are provided.
   * @throws {Error} If the identity has been destroyed.
   * @todo -- add the receipt request and processing
   */
  rotate({ keyPairs, nextKeyPairs, backers = [] }) {
    var _a;
    if (!this.identifier || !((_a = this.keyEventLog) == null ? void 0 : _a.length)) {
      throw Error("Keys can not be rotated before inception");
    }
    if (!keyPairs) {
      throw new Error("Key pairs required for rotation");
    }
    if (!nextKeyPairs) {
      throw new Error("Next signing key committment required for rotation");
    }
    if (this.keyEventLog[this.keyEventLog.length - 1].eventType === "destruction") {
      throw new Error("Keys can not be rotated after destruction");
    }
    const keyHash = this.hash(keyPairs.signing.publicKey);
    if (keyHash !== this.keyEventLog[this.keyEventLog.length - 1].nextKeyCommitments[0]) {
      throw new Error("Key commitment does not match the current key commitment");
    }
    this.keyPairs = keyPairs;
    const nextKeyHash = this.hash(nextKeyPairs.signing.publicKey);
    this.rotateKeys({
      identifier: this.identifier,
      eventType: "rotation",
      nextKeyCommitments: [nextKeyHash],
      backers
    });
  }
  /**
   * Destroy an identity.
   * @param {string[]} backers - The list of backers to use for the destruction event.
   * @returns {object} The destruction event.
   * @throws {Error} If the identity has not been incepted.
   * @throws {Error} If the identity has been destroyed.
   * @todo -- add the receipt request and processing
   */
  destroy(args) {
    var _a;
    const { backers = [] } = args || {};
    if (!this.identifier || !((_a = this.keyEventLog) == null ? void 0 : _a.length)) {
      throw Error("Identity does not exist");
    }
    if (this.keyEventLog[this.keyEventLog.length - 1].eventType === "destruction") {
      throw new Error("Identity has already been destroyed");
    }
    this.rotateKeys({
      identifier: this.identifier,
      eventType: "destruction",
      nextKeyCommitments: [],
      backers
    });
  }
  rotateKeys({ identifier, eventType, nextKeyCommitments, backers }) {
    const oldKeyEvent = this.keyEventLog[this.keyEventLog.length - 1];
    const publicSigningKey = this.keyPairs.signing.publicKey;
    const rotationEvent = this.createEvent({
      identifier,
      oldKeyEvent,
      eventType,
      publicSigningKey,
      nextKeyCommitments,
      backers
    });
    this.keyEventLog.push(rotationEvent);
  }
  createEvent({
    identifier,
    oldKeyEvent,
    eventType,
    publicSigningKey,
    nextKeyCommitments,
    backers
  }) {
    const event = {
      identifier,
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType,
      signingThreshold: oldKeyEvent.signingThreshold,
      signingKeys: [publicSigningKey],
      nextKeyCommitments,
      backerThreshold: oldKeyEvent.backerThreshold,
      backers: [...backers]
    };
    const eventJSON = JSON.stringify(event);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = this.hash(eventJSON);
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });
    return {
      ...event,
      previousEventDigest: oldKeyEvent.selfAddressingIdentifier,
      selfAddressingIdentifier: signedEventHash,
      version
    };
  }
  // todo -- error handling
  import({ keyPairs, data }) {
    this.keyPairs = keyPairs;
    const decrypted = this.decrypt({ data });
    const deepCopy = JSON.parse(JSON.stringify(decrypted));
    delete deepCopy.postMessage;
    Object.assign(this, deepCopy);
  }
  /**
   * Export an identity, excluding the key pairs.
   */
  export() {
    const { keyPairs, ...data } = this;
    const encrypted = this.encrypt({ data: JSON.stringify(data) });
    return encrypted;
  }
  /**
   * Helper to get the class hierarchy of the current instance.
   * @returns {string[]} - The class hierarchy of the current instance.
   */
  is() {
    var _a;
    let hierarchy = [];
    let proto = Object.getPrototypeOf(this);
    while (proto) {
      let name = (_a = proto.constructor) == null ? void 0 : _a.name;
      if (!name || name === "Object")
        break;
      hierarchy.push(name);
      proto = Object.getPrototypeOf(proto);
    }
    return hierarchy;
  }
}

export { BaseIdentity as default };
