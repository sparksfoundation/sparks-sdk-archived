import { Spark } from '../Spark.js';
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
  protected spark: Spark; // TODO define spark interface

  constructor(spark: Spark) {
    this.spark = spark;
    this.keyEventLog = [];
  }

  get keypairs(): KeyPairs {
    return this.keyPairs;
  }

  get encryptionKeys(): EncryptionKeyPair {
    return {
      publicKey: this.keyPairs.encryption.publicKey,
      secretKey: this.keyPairs.encryption.secretKey,
    };
  }

  get signingKeys(): SigningKeyPair {
    return {
      publicKey: this.keyPairs.signing.publicKey,
      secretKey: this.keyPairs.signing.secretKey,
    };
  }

  get secretKeys(): SecretKeys {
    return {
      signing: this.keyPairs.signing.secretKey,
      encryption: this.keyPairs.encryption.secretKey,
    };
  }

  get publicKeys(): PublicKeys {
    return {
      signing: this.keyPairs.signing.publicKey,
      encryption: this.keyPairs.encryption.publicKey,
    };
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
      // force null the keyPairs - todo review this feels funny
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
    const keyHash = keyPairs ? await this.spark.hash(keyPairs.signing.publicKey) : null;
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

    const nextKeyCommitments = [await this.spark.hash(nextKeyPairs.signing.publicKey)]
    const eventIndex = this.keyEventLog.length
    const signingKeys = [keyPairs.signing.publicKey]

    const event = {
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
    const hashedEvent = await this.spark.hash(eventJSON);
    const signedEventHash = await this.spark.sign({ data: hashedEvent, detached: true });
    const identifier = this.identifier || `B${signedEventHash}`;

    if (eventType === KeriEventType.ROTATION) {
      const previousEventDigest: string = this.keyEventLog[this.keyEventLog.length - 1].selfAddressingIdentifier;
      if (!previousEventDigest) throw new Error('Previous event digest not found');
      (event as KeriRotationEvent).previousEventDigest = previousEventDigest;
    }

    const keyEvent = {
      ...event,
      identifier: identifier,
      selfAddressingIdentifier: signedEventHash,
      version: version,
    };

    return keyEvent as KeriKeyEvent;
  }

  // todo - some thinking around how to handle this given dynamic agents
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
