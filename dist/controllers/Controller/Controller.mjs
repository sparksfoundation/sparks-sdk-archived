import {
  KeriEventType
} from "./types.mjs";
export class Controller {
  constructor(spark) {
    this.spark = spark;
    this.keyEventLog = [];
  }
  get encryptionKeys() {
    return {
      publicKey: this.keyPairs.encryption.publicKey,
      secretKey: this.keyPairs.encryption.secretKey
    };
  }
  get signingKeys() {
    return {
      publicKey: this.keyPairs.signing.publicKey,
      secretKey: this.keyPairs.signing.secretKey
    };
  }
  get secretKeys() {
    return {
      signing: this.keyPairs.signing.secretKey,
      encryption: this.keyPairs.encryption.secretKey
    };
  }
  get publicKeys() {
    return {
      signing: this.keyPairs.signing.publicKey,
      encryption: this.keyPairs.encryption.publicKey
    };
  }
  async incept({ keyPairs, nextKeyPairs, backers = [] }) {
    this.keyPairs = keyPairs;
    const inceptionEvent = await this.keyEvent({
      keyPairs,
      nextKeyPairs,
      eventType: KeriEventType.INCEPTION,
      backers: [...backers]
    });
    if (!inceptionEvent) {
      this.keyPairs = void 0;
      throw new Error("Inception failed");
    }
    const { identifier } = inceptionEvent;
    this.identifier = identifier;
    this.keyPairs = keyPairs;
    this.keyEventLog.push(inceptionEvent);
  }
  async rotate({ keyPairs, nextKeyPairs, backers = [] }) {
    const rotationEvent = await this.keyEvent({
      keyPairs,
      nextKeyPairs,
      eventType: KeriEventType.ROTATION,
      backers: [...backers]
    });
    if (!rotationEvent)
      throw new Error("Rotation failed");
    this.keyPairs = keyPairs;
    this.keyEventLog.push(rotationEvent);
  }
  async delete(args) {
    const { backers = [] } = args || {};
    const deletionEvent = await this.keyEvent({
      eventType: KeriEventType.DELETION,
      backers: [...backers]
    });
    if (!deletionEvent)
      throw new Error("Deletion failed");
    this.keyPairs = { signing: { publicKey: "", secretKey: "" }, encryption: { publicKey: "", secretKey: "" } };
    this.keyEventLog.push(deletionEvent);
  }
  async keyEvent(args) {
    const { eventType, backers = [] } = args || {};
    const { keyPairs, nextKeyPairs } = args || {};
    const lastEvent = this.keyEventLog[this.keyEventLog.length - 1];
    const keyHash = keyPairs ? await this.spark.hash(keyPairs.signing.publicKey) : null;
    const hasKeyPairs = !!keyPairs && !!nextKeyPairs;
    const isIncepted = !!this.identifier || !!this.keyEventLog?.length;
    const isDeleted = lastEvent?.eventType === KeriEventType.DELETION;
    const isValidCommit = keyHash === lastEvent?.nextKeyCommitments[0];
    if (eventType === KeriEventType.INCEPTION) {
      if (isIncepted)
        throw new Error("Identity already incepted");
      if (!hasKeyPairs)
        throw new Error("current and next key pairs required for inception");
    } else if (eventType === KeriEventType.ROTATION) {
      if (!isIncepted)
        throw Error("Keys can not be rotated before inception");
      if (!hasKeyPairs)
        throw new Error("current and next key pairs required for rotation");
      if (isDeleted)
        throw new Error("Keys can not be rotated after destruction");
      if (!isValidCommit)
        throw new Error("Key commitment does not match the current key commitment");
    } else if (eventType === KeriEventType.DELETION) {
      if (isDeleted)
        throw new Error("Identity has already been deleted");
    }
    const eventIndex = this.keyEventLog.length;
    const nextKeyCommitments = eventType === KeriEventType.DELETION ? [] : [await this.spark.hash(nextKeyPairs.signing.publicKey)];
    const signingKeys = eventType === KeriEventType.DELETION ? [] : [keyPairs.signing.publicKey];
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
    const signedEventHash = await this.spark.sign({ data: hashedEvent, detached: true });
    const identifier = this.identifier || `B${signedEventHash}`;
    if (eventType === KeriEventType.ROTATION) {
      const previousEventDigest = this.keyEventLog[this.keyEventLog.length - 1].selfAddressingIdentifier;
      if (!previousEventDigest)
        throw new Error("Previous event digest not found");
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
  async import({ keyPairs, data }) {
    this.keyPairs = keyPairs;
    const decrypted = await this.spark.decrypt({ data });
    const deepCopy = JSON.parse(JSON.stringify(decrypted));
    delete deepCopy.postMessage;
    Object.assign(this, deepCopy);
  }
  async export() {
    const { keyPairs, ...data } = this;
    const encrypted = await this.spark.encrypt({ data: JSON.stringify(data) });
    return encrypted;
  }
}
