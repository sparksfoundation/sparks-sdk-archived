import { Backers, Controller as ControllerType, EventType, KeriEvents, KeriEventOptions, KeyPairs, KeriRotationEvent, KeriDeletionEventOptions, KeriRotationEventOptions, KeriInceptionEventOptions } from '../types/index.js'

export class Controller extends ControllerType {
  static type = ControllerType.type;
  constructor(args) {
    super(args);
  }

  protected get publicKeys() {
    const signing = this.keyPairs.signing?.publicKey;
    const encryption = this.keyPairs.encryption?.publicKey;
    if (!signing || !encryption) throw Error('No public keys');
    return { signing, encryption };
  }

  incept(args: { keyPairs: KeyPairs; nextKeyPairs: KeyPairs, backers: Backers }): void {
    const { keyPairs, nextKeyPairs, backers } = args;
    if (this.identifier || this.keyEventLog?.length) {
      throw Error('Identity already incepted');
    }

    if (!keyPairs) {
      throw new Error('Key pairs required for inception')
    }

    if (!nextKeyPairs) {
      throw new Error('Next signing key commitment required for inception')
    }

    const inceptionEvent = this.keyEvent({
      keyPairs,
      nextKeyPairs,
      eventType: EventType.INCEPTION,
      backers: [...backers],
    } as KeriInceptionEventOptions);

    if (!inceptionEvent) {
      throw new Error('Inception event not created')
    }

    const { identifier } = inceptionEvent;
    this.identifier = identifier;
    this.keyPairs = keyPairs;
    this.keyEventLog = [inceptionEvent];
    // todo -- queue the receipt request
  }

  rotate(args: { keyPairs: KeyPairs; nextKeyPairs: KeyPairs, backers: Backers }): void {
    const { keyPairs, nextKeyPairs, backers } = args;

    if (!this.identifier || !this.keyEventLog?.length) {
      throw Error('Keys can not be rotated before inception');
    }

    if (!keyPairs) {
      throw new Error('Key pairs required for rotation')
    }

    if (!nextKeyPairs) {
      throw new Error('Next signing key committment required for rotation')
    }

    const lastEvent = this.keyEventLog[this.keyEventLog.length - 1];
    if (lastEvent.eventType as EventType === EventType.DELETION) {
      throw new Error('Keys can not be rotated after destruction');
    }

    const keyHash = this.hash(keyPairs.signing.publicKey);
    if (keyHash !== this.keyEventLog[this.keyEventLog.length - 1].nextKeyCommitments[0]) {
      throw new Error('Key commitment does not match the current key commitment');
    }

    const rotationEvent = this.keyEvent({
      keyPairs,
      nextKeyPairs,
      eventType: EventType.ROTATION,
      backers: [...backers],
    } as KeriRotationEventOptions);

    if (!rotationEvent) {
      throw new Error('Rotation failed')
    }

    const { identifier } = rotationEvent;
    this.identifier = identifier;
    this.keyPairs = keyPairs;
    this.keyEventLog = [rotationEvent];
    // todo -- queue the receipt request
  }

  destroy(args?: { backers?: Backers }): void {
    const { backers = [] } = args || {};
    if (!this.identifier || !this.keyEventLog?.length) {
      throw Error('Identity does not exist');
    }

    const lastEvent = this.keyEventLog[this.keyEventLog.length - 1];
    if (lastEvent.eventType as EventType === EventType.DELETION) {
      throw new Error('Identity has already been destroyed');
    }

    const deletionEvent = this.keyEvent({
      eventType: EventType.DELETION,
      backers: [...backers],
    } as KeriDeletionEventOptions);
  }

  keyEvent(args: KeriEventOptions): KeriEvents {
    // todo -- validate args and throw errors
    const { eventType, backers = [] } = args
    const keyPairs = eventType === EventType.INCEPTION ? args.keyPairs : this.keyPairs
    const nextKeyPairs = eventType === EventType.INCEPTION ? args.nextKeyPairs : this.keyPairs

    if (!this.identifier || !this.keyEventLog?.length) {
      throw Error('Identity has not been incepted')
    }

    if (eventType !== EventType.DELETION && !(keyPairs && nextKeyPairs)) {
      throw new Error('Key pairs required for rotation and inception')
    }

    const identifier = this.identifier || `B${keyPairs.signing.publicKey.replace(/=$/, '')}`
    const nextKeyCommitments = [this.hash(nextKeyPairs.signing.publicKey)]
    const eventIndex = this.keyEventLog.length
    const signingKeys = [keyPairs.signing.publicKey]

    const event = {
      identifier,
      eventIndex,
      eventType,
      signingThreshold: 1,
      signingKeys,
      nextKeyCommitments,
      backerThreshold: 1,
      backers,
    } as KeriEvents;

    const eventJSON = JSON.stringify(event);
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = this.hash(eventJSON);
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });

    if (eventType === EventType.ROTATION) {
      const previousEventDigest = this.keyEventLog[this.keyEventLog.length - 1].selfAddressingIdentifier;
      if (!previousEventDigest) throw new Error('Previous event digest not found');
      (event as KeriRotationEvent).previousEventDigest = previousEventDigest;
    }

    const inceptionEvent: KeriEvents = {
      ...event,
      selfAddressingIdentifier: signedEventHash,
      version: version,
    };

    return inceptionEvent
  }
}


