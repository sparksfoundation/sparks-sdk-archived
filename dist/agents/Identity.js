class Identity {
  identifier;
  keyPairs;
  keyEventLog;
  constructor() {
    this.identifier = null;
    this.keyPairs = {};
    this.keyEventLog = [];
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
    const hashedEvent = this.hash(eventJSON);
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;
    this.identifier = identifier;
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
    const oldKeyEvent = this.keyEventLog[this.keyEventLog.length - 1];
    const publicSigningKey = this.keyPairs.signing.publicKey;
    const nextKeyHash = this.hash(nextKeyPairs.signing.publicKey);
    const rotationEvent = {
      identifier: this.identifier,
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: "rotation",
      signingThreshold: oldKeyEvent.signingThreshold,
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [nextKeyHash],
      backerThreshold: oldKeyEvent.backerThreshold,
      backers: [...backers]
    };
    const eventJSON = JSON.stringify(rotationEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = this.hash(eventJSON);
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });
    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;
    this.keyEventLog.push(rotationEvent);
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
    const oldKeyEvent = this.keyEventLog[this.keyEventLog.length - 1];
    const publicSigningKey = this.keyPairs.signing.publicKey;
    const rotationEvent = {
      identifier: this.identifier,
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
    const hashedEvent = this.hash(eventJSON);
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });
    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;
    this.keyEventLog.push(rotationEvent);
  }
  // todo -- error handling
  import({ keyPairs, data }) {
    this.keyPairs = keyPairs;
    const decrypted = this.decrypt({ data });
    const deepCopy = JSON.parse(JSON.stringify(decrypted));
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

export { Identity };
