import { Spark } from '../../Spark';
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
} from './types'

export class Controller implements IController {
  protected _identifier: Identifier
  protected _keyPairs: KeyPairs;
  protected _keyEventLog: KeriKeyEvent[];
  protected spark: Spark; 

  constructor(spark: Spark) {
    if (!spark) throw new Error('Channel: missing spark');
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
    this._keyEventLog = [];
  }

  get identifier(): Identifier {
    return this._identifier;
  }

  get keyEventLog(): KeriKeyEvent[] {
    return this._keyEventLog;
  }

  get keyPairs(): KeyPairs {
    return this._keyPairs;
  }

  get encryptionKeys(): EncryptionKeyPair {
    return {
      publicKey: this._keyPairs.encryption.publicKey,
      secretKey: this._keyPairs.encryption.secretKey,
    };
  }

  get signingKeys(): SigningKeyPair {
    return {
      publicKey: this._keyPairs.signing.publicKey,
      secretKey: this._keyPairs.signing.secretKey,
    };
  }

  get secretKeys(): SecretKeys {
    return {
      signing: this._keyPairs.signing.secretKey,
      encryption: this._keyPairs.encryption.secretKey,
    };
  }

  get publicKeys(): PublicKeys {
    return {
      signing: this._keyPairs.signing.publicKey,
      encryption: this._keyPairs.encryption.publicKey,
    };
  }

  public async incept(args: InceptionArgs) {
    const { keyPairs, nextKeyPairs, backers = [] } = args || {};
    this._keyPairs = keyPairs; // needed for signing
    const inceptionEvent = await this.keyEvent({
      keyPairs,
      nextKeyPairs,
      eventType: KeriEventType.INCEPTION,
      backers: [...backers],
    } as KeriInceptionEventArgs);

    if (!inceptionEvent) {
      // force null the keyPairs - todo review this feels funny
      this._keyPairs = undefined as any;
      throw new Error('Inception failed');
    }

    const { identifier } = inceptionEvent;
    this._identifier = identifier;
    this._keyPairs = keyPairs;
    this._keyEventLog.push(inceptionEvent);
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

    this._keyPairs = keyPairs;
    this._keyEventLog.push(rotationEvent);
    // todo -- queue the receipt request
  }

  public async delete(args: DeletionArgs) {
    const { backers = [] } = args || {};
    const deletionEvent = await this.keyEvent({
      eventType: KeriEventType.DELETION,
      backers: [...backers],
    } as KeriDeletionEventArgs);

    if (!deletionEvent) throw new Error('Deletion failed');

    this._keyPairs = { signing: { publicKey: '', secretKey: '' }, encryption: { publicKey: '', secretKey: '' } };
    this._keyEventLog.push(deletionEvent);
  }

  protected async keyEvent(args: KeriEventArgs) {
    const { eventType, backers = [] } = args || {};
    const { keyPairs, nextKeyPairs } = (args || {}) as KeriInceptionEventArgs | KeriRotationEventArgs;
    const lastEvent = this._keyEventLog[this._keyEventLog.length - 1];
    const keyHash = keyPairs ? await this.spark.hash(keyPairs.signing.publicKey) : null;
    const hasKeyPairs = !!keyPairs && !!nextKeyPairs;
    const isIncepted = !!this.identifier || !!this._keyEventLog?.length;
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
    
    const eventIndex = this._keyEventLog.length
    const nextKeyCommitments = eventType === KeriEventType.DELETION ? [] : [await this.spark.hash(nextKeyPairs.signing.publicKey)];
    const signingKeys = eventType === KeriEventType.DELETION ? [] : [keyPairs.signing.publicKey];

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
      const previousEventDigest: string = this._keyEventLog[this._keyEventLog.length - 1].selfAddressingIdentifier;
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

  // todo - some thinking around how to handle import and export given dynamic agents
  async import({ keyPairs, data }) {
    this._keyPairs = keyPairs;
    const decrypted = await this.spark.decrypt({ data });
    const deepCopy = JSON.parse(JSON.stringify(decrypted));
    delete deepCopy.postMessage;
    Object.assign(this, deepCopy);
  }

  async export(args?: any): Promise<any> {
    const { _keyPairs, ...data } = this;
    const encrypted = await this.spark.encrypt({ data: JSON.stringify(data) });
    return encrypted;
  }
}
