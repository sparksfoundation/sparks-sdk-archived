import { ISpark } from '../../Spark';
import {
  EncryptionKeyPair,
  IController,
  Identifier,
  KeriDeletionEventArgs,
  KeriEvent,
  KeriEventType,
  KeriInceptionEventArgs,
  KeriKeyEvent,
  KeriRotationEvent,
  KeriRotationEventArgs,
  KeyEventMethod,
  KeyPairs,
  PublicKeys,
  SecretKeys,
  SigningKeyPair,
} from './types'

export class Controller implements IController {
  protected spark: ISpark<any, any, any, any, any>;
  public identifier: Identifier;
  public keyPairs: KeyPairs;
  public keyEventLog: KeriKeyEvent[];

  constructor(spark: ISpark<any, any, any, any, any>) {
    this.spark = spark;
    this.keyEventLog = [];
    this.incept = this.incept.bind(this);
    this.rotate = this.rotate.bind(this);
    this.delete = this.delete.bind(this);
    this.import = this.import.bind(this);
    this.export = this.export.bind(this);
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
  }

  get encryptionKeys(): EncryptionKeyPair { 
    return { 
      publicKey: this.keyPairs.encryption.publicKey, 
      secretKey: this.keyPairs.encryption.secretKey 
    }
  }
  
  get signingKeys(): SigningKeyPair {
    return { 
      publicKey: this.keyPairs.signing.publicKey, 
      secretKey: this.keyPairs.signing.secretKey 
    }
  }

  get secretKeys(): SecretKeys { 
    return { 
      signing: this.keyPairs.signing.secretKey, 
      encryption: this.keyPairs.encryption.secretKey 
    }
  }

  get publicKeys(): PublicKeys { 
    return { 
      signing: this.keyPairs.signing.publicKey, 
      encryption: this.keyPairs.encryption.publicKey 
    }
  }

  public async incept({ keyPairs, nextKeyPairs, backers = [] }: Parameters<IController['incept']>[0]): ReturnType<IController['incept']> {
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

  public async rotate({ keyPairs, nextKeyPairs, backers = [] }: Parameters<IController['rotate']>[0]): ReturnType<IController['rotate']> {
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

  public async delete(args: Parameters<IController['delete']>[0]): ReturnType<IController['delete']> {
    const { backers = [] } = args || {};
    const deletionEvent = await this.keyEvent({
      eventType: KeriEventType.DELETION,
      backers: [...backers],
    } as KeriDeletionEventArgs);

    if (!deletionEvent) throw new Error('Deletion failed');

    this.keyPairs = { signing: { publicKey: '', secretKey: '' }, encryption: { publicKey: '', secretKey: '' } };
    this.keyEventLog.push(deletionEvent);
  }

  protected async keyEvent(args: Parameters<KeyEventMethod>[0]): ReturnType<KeyEventMethod> {
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
    
    const eventIndex = this.keyEventLog.length
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

  // todo - some thinking around how to handle import and export given dynamic agents
  async import({ keyPairs, data }: Parameters<IController['import']>[0]): ReturnType<IController['import']> {
    this.keyPairs = keyPairs;
    const decrypted = await this.spark.decrypt({ data });
    const deepCopy = JSON.parse(JSON.stringify(decrypted));
    delete deepCopy.postMessage;
    Object.assign(this, deepCopy);
  }

  async export(): ReturnType<IController['export']> {
    console.log('exporting', this);
    const { keyPairs, ...data } = this;
    const encrypted = await this.spark.encrypt({ data: JSON.stringify(data) });
    return encrypted;
  }
}
