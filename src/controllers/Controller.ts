import {
  DeletionArgs,
  EncryptionKeyPair,
  IController,
  Identifier,
  InceptionArgs,
  KeriDeletionEventArgs,
  KeriEvent,
  KeriEventArgs,
  KeriEventType,
  KeriInceptionEventArgs,
  KeriKeyEvent,
  KeriRotationEvent,
  KeriRotationEventArgs,
  KeyPairs,
  PublicKeys,
  RotationArgs,
  SecretKeys,
  SigningKeyPair,
} from './types.js'

export class Controller implements IController {
  protected identifier: Identifier
  protected keyPairs: KeyPairs;
  protected keyEventLog: KeriKeyEvent[];
  protected spark: any; // TODO define spark interface

  constructor(spark) {
    this.spark = spark;
    this.keyEventLog = [];
  }

  get encryptionKeys() {
    return {
      publicKey: this.keyPairs.encryption.publicKey,
      secretKey: this.keyPairs.encryption.secretKey,
    } as EncryptionKeyPair;
  }

  get signingKeys() {
    return {
      publicKey: this.keyPairs.signing.publicKey,
      secretKey: this.keyPairs.signing.secretKey,
    } as SigningKeyPair;
  }

  get secretKeys() {
    return {
      signing: this.keyPairs.signing.secretKey,
      encryption: this.keyPairs.encryption.secretKey,
    } as SecretKeys;
  }

  get publicKeys() {
    return {
      signing: this.keyPairs.signing.publicKey,
      encryption: this.keyPairs.encryption.publicKey,
    } as PublicKeys;
  }

  public async incept(args: InceptionArgs) {
    const { keyPairs, nextKeyPairs, backers = [] } = args || {};
    this.keyPairs = keyPairs; // needed for signing
    const inceptionEvent = await this.keyEvent({
      keyPairs,
      nextKeyPairs,
      eventType: KeriEventType.INCEPTION,
      backers: [...backers],
    } as KeriInceptionEventArgs);

    if (!inceptionEvent) {
      // force null the keyPairs
      this.keyPairs = undefined as any;
      throw new Error('Inception failed');
    }

    const { identifier } = inceptionEvent;
    this.identifier = identifier;
    this.keyPairs = keyPairs;
    this.keyEventLog.push(inceptionEvent);
    // todo -- queue the receipt request
  }

  public async rotate(args: RotationArgs) {
    const { keyPairs, nextKeyPairs, backers = [] } = args;

    const rotationEvent = await this.keyEvent({
      keyPairs,
      nextKeyPairs,
      eventType: KeriEventType.ROTATION,
      backers: [...backers],
    } as KeriRotationEventArgs);

    if (!rotationEvent) throw new Error('Rotation failed')

    this.keyPairs = keyPairs;
    this.keyEventLog.push(rotationEvent);
    // todo -- queue the receipt request
  }

  public async delete(args: DeletionArgs) {
    const { backers = [] } = args || {};
    const deletionEvent = await this.keyEvent({
      eventType: KeriEventType.DELETION,
      backers: [...backers],
    } as KeriDeletionEventArgs);

    if (!deletionEvent) throw new Error('Deletion failed');

    this.keyPairs = { signing: { publicKey: '', secretKey: '' }, encryption: { publicKey: '', secretKey: '' } };
    this.keyEventLog.push(deletionEvent);
  }

  protected async keyEvent(args: KeriEventArgs) {
    const { eventType, backers = [] } = args || {};
    const { keyPairs, nextKeyPairs } = (args || {}) as KeriInceptionEventArgs | KeriRotationEventArgs;
    const lastEvent = this.keyEventLog[this.keyEventLog.length - 1];
    const keyHash = keyPairs ? await this.spark.hasher.hash(keyPairs.signing.publicKey) : null;
    const hasKeyPairs = !!keyPairs && !!nextKeyPairs;
    const isIncepted = !!this.identifier || !!this.keyEventLog?.length;
    const isDeleted = lastEvent?.eventType as KeriEventType === KeriEventType.DELETION;
    const isValidCommit = keyHash === lastEvent?.nextKeyCommitments[0];

    if (eventType === KeriEventType.INCEPTION) {
      if (isIncepted) throw new Error('Identity already incepted')
      if (!hasKeyPairs) throw new Error('current and next key pairs required for inception')
    } else if (eventType === KeriEventType.ROTATION) {
      if (!isIncepted) throw Error('Keys can not be rotated before inception');
      if (!hasKeyPairs) throw new Error('current and next key pairs required for rotation')
      if (isDeleted) throw new Error('Keys can not be rotated after destruction');
      if (!isValidCommit) throw new Error('Key commitment does not match the current key commitment');
    } else if (eventType === KeriEventType.DELETION) {
      if (isDeleted) throw new Error('Identity has already been deleted');
    }

    const identifier = this.identifier || `B${keyPairs.signing.publicKey.replace(/=$/, '')}`
    const nextKeyCommitments = [await this.spark.hasher.hash(nextKeyPairs.signing.publicKey)]
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
    } as KeriEvent;

    const eventJSON = JSON.stringify(event);
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = await this.spark.hasher.hash(eventJSON);
    const signedEventHash = await this.spark.signer.sign({ data: hashedEvent, detached: true });

    if (eventType === KeriEventType.ROTATION) {
      const previousEventDigest: string = this.keyEventLog[this.keyEventLog.length - 1].selfAddressingIdentifier;
      if (!previousEventDigest) throw new Error('Previous event digest not found');
      (event as KeriRotationEvent).previousEventDigest = previousEventDigest;
    }

    const keyEvent = {
      ...event,
      selfAddressingIdentifier: signedEventHash,
      version: version,
    };

    return keyEvent as KeriKeyEvent;
  }

  async import({ keyPairs, data }) {
    throw new Error('Not implemented');
    // todo -- do import
  }

  async export(): Promise<any> {
    // todo -- do export
    throw new Error('Not implemented');
    return '';
  }
}