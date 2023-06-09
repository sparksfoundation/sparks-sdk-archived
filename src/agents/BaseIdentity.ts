type KeriEvent = {
  identifier: string,                // i: AID identifier prefix
  eventIndex: string,                // s: sequence number
  eventType: string,                 // t: event type
  signingThreshold: string,          // kt: minimum amount of signatures needed for this event to be valid (multisig)
  signingKeys: Array<string>,        // k: list of signing keys
  nextKeyCommitments: Array<string>, // n: next keys, added encryption because it makes sense imo
  backerThreshold: string,           // bt: minimum amount of witnesses threshold - I think these are called backers now
  backers: Array<string>,            // b: list of witnesses in this case the spark pwa-agent host's publickey there's no receipt at this step
}

type OmitPreviousEvent<T = KeriSAIDEvent> = T extends KeriSAIDEvent ? Omit<T, 'previousEventDigest'> : never;

type InceptionEvent = OmitPreviousEvent & {
  previousEventDigest: null,
}

type KeriSAIDEvent = KeriEvent & {
  previousEventDigest: string,
  selfAddressingIdentifier: string,
  version: string,
}

// an inception event does not have a "previousEventDigest"
// all other events do

export default abstract class BaseIdentity {
  abstract encrypt({ publicKey, data }: { sharedKey?: string, publicKey?: string, data: string }): string;
  abstract decrypt({ publicKey, data }: { sharedKey?: string, publicKey?: string, data: string }): string;
  abstract sign({ data, detached }: { data: string, detached: boolean }): string;
  abstract verify({ publicKey, signature, data }: { publicKey: string, signature: string, data: string | object }): void;
  abstract hash(data: string): string;

  protected identifier: string | null;
  protected keyPairs: any;
  protected keyEventLog: any[];

  constructor() {
    this.identifier = null;
    this.keyPairs = {};
    this.keyEventLog = [];
  }

  protected get publicKeys() {
    const signing = this.keyPairs.signing?.publicKey;
    const encryption = this.keyPairs.encryption?.publicKey;
    if (!signing || !encryption) return null;
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
  incept({ keyPairs, nextKeyPairs, backers = [] }: { keyPairs: any, nextKeyPairs: any, backers?: string[] }) {
    if (this.identifier || this.keyEventLog?.length) {
      throw Error('Identity already incepted');
    }

    if (!keyPairs) {
      throw new Error('Key pairs required for inception')
    }

    if (!nextKeyPairs) {
      throw new Error('Next signing key commitment required for inception')
    }

    this.keyPairs = keyPairs;
    const identifier = `B${this.keyPairs.signing.publicKey.replace(/=$/, '')}`;
    const publicSigningKey = this.keyPairs.signing.publicKey;
    const nextKeyHash = this.hash(nextKeyPairs.signing.publicKey)

    const event = {
      identifier: identifier,
      eventIndex: '0',
      eventType: 'inception',
      signingThreshold: '1',
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [nextKeyHash],
      backerThreshold: '1',
      backers: [...backers],
    };

    const eventJSON = JSON.stringify(event);
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = this.hash(eventJSON);
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });

    const inceptionEvent: InceptionEvent = {
      ...event,
      previousEventDigest: null,
      selfAddressingIdentifier: signedEventHash,
      version: version,
    };

    // todo -- queue the receipt request
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
  rotate({ keyPairs, nextKeyPairs, backers = [] }: { keyPairs: any, nextKeyPairs: any, backers?: string[] }) {
    if (!this.identifier || !this.keyEventLog?.length) {
      throw Error('Keys can not be rotated before inception');
    }

    if (!keyPairs) {
      throw new Error('Key pairs required for rotation')
    }

    if (!nextKeyPairs) {
      throw new Error('Next signing key committment required for rotation')
    }

    if ((this.keyEventLog[this.keyEventLog.length - 1]).eventType === 'destruction') {
      throw new Error('Keys can not be rotated after destruction');
    }

    const keyHash = this.hash(keyPairs.signing.publicKey);
    if (keyHash !== this.keyEventLog[this.keyEventLog.length - 1].nextKeyCommitments[0]) {
      throw new Error('Key commitment does not match the current key commitment');
    }

    this.keyPairs = keyPairs;
    const oldKeyEvent = this.keyEventLog[this.keyEventLog.length - 1];
    const publicSigningKey = this.keyPairs.signing.publicKey;
    const nextKeyHash = this.hash(nextKeyPairs.signing.publicKey);

    const rotationEvent: KeriSAIDEvent = this.createEvent({
      identifier: this.identifier,
      oldKeyEvent: oldKeyEvent,
      eventType: 'rotation',
      publicSigningKey: publicSigningKey,
      nextKeyHash: nextKeyHash,
      backers: backers,
    })
    // todo queue witness receipt request
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
  destroy(args?: { backers?: string[] }) {
    const { backers = [] } = args || {};
    if (!this.identifier || !this.keyEventLog?.length) {
      throw Error('Identity does not exist');
    }

    if ((this.keyEventLog[this.keyEventLog.length - 1]).eventType === 'destruction') {
      throw new Error('Identity has already been destroyed');
    }

    const oldKeyEvent = this.keyEventLog[this.keyEventLog.length - 1];
    const publicSigningKey = this.keyPairs.signing.publicKey;

    const rotationEvent = {
      identifier: this.identifier,
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: 'destruction',
      signingThreshold: oldKeyEvent.signingThreshold,
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [],
      backerThreshold: oldKeyEvent.backerThreshold,
      backers: [...backers],
    } as any; // todo -- fix this type

    const eventJSON = JSON.stringify(rotationEvent);
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = this.hash(eventJSON);
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });

    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;

    // todo queue witness receipt request
    this.keyEventLog.push(rotationEvent);
  }

  createEvent(
    {
      identifier,
      oldKeyEvent,
      eventType,
      publicSigningKey,
      nextKeyHash,
      backers,
    }: {
      identifier: string,
      oldKeyEvent: KeriSAIDEvent,
      eventType: string,
      publicSigningKey: string,
      nextKeyHash: string,
      backers: Array<string>,
    }): KeriSAIDEvent {
    const event = {
      identifier: identifier,
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: eventType,
      signingThreshold: oldKeyEvent.signingThreshold,
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [nextKeyHash],
      backerThreshold: oldKeyEvent.backerThreshold,
      backers: [...backers],
    };

    const eventJSON = JSON.stringify(event);
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = this.hash(eventJSON);
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });

    return {
      ...event,
      previousEventDigest: oldKeyEvent.selfAddressingIdentifier,
      selfAddressingIdentifier: signedEventHash,
      version: version,
    };
  }

  // todo -- error handling
  import({ keyPairs, data }: { keyPairs: any, data: string }) {
    this.keyPairs = keyPairs;
    const decrypted = this.decrypt({ data });
    const deepCopy = JSON.parse(JSON.stringify(decrypted));
    // temp fix
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
    let hierarchy = [] as string[];
    let proto = Object.getPrototypeOf(this);

    while (proto) {
      let name = proto.constructor?.name;
      if (!name || name === 'Object') break;
      hierarchy.push(name);
      proto = Object.getPrototypeOf(proto);
    }

    return hierarchy;
  }
}
