import { Backer, BaseKeyEventProps, CommonKeyEventProps, ControllerErrorType, ControllerInterface, Identifier, KeyDestructionEvent, KeyEvent, KeyEventLog, KeyInceptionEvent, KeyRotationEvent } from "./types";
import { ErrorInterface, ErrorMessage, SparkError } from "../common/errors";
import errors from "./errorFactory";
import { KeyEventType } from "./types";
import { KeyPairs, SparkInterface } from "../types";

export class Controller implements ControllerInterface {
  private _identifier: Identifier;
  private _keyEventLog: KeyEventLog;
  private _spark: SparkInterface<any, any, any, any>;

  constructor(spark: SparkInterface<any, any, any, any>) {
    this._spark = spark;
    this._keyEventLog = [];
    this.getIdentifier = this.getIdentifier.bind(this);
    this.getKeyEventLog = this.getKeyEventLog.bind(this);
    this.incept = this.incept.bind(this);
    this.rotate = this.rotate.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  public getIdentifier(): ReturnType<ControllerInterface['getIdentifier']> {
    return this._identifier ? this._identifier : errors.InvalidIdentifier();
  }

  public getKeyEventLog(): ReturnType<ControllerInterface['getKeyEventLog']> {
    return this._keyEventLog ? this._keyEventLog : errors.InvalidKeyEventLog();
  }

  private async keyEvent({ nextKeyPairs, type, backers = [] }: { nextKeyPairs?: KeyPairs, type: KeyEventType, backers: Backer[] }): Promise<KeyEvent | ErrorInterface> {
    try {
      switch (true) {
        case this._keyEventLog.length > 0 && this._keyEventLog[this._keyEventLog.length - 1].type === KeyEventType.DESTROY:
          return errors.IdentityDestroyed();
        case type === KeyEventType.INCEPT && this._keyEventLog.length > 0:
          return errors.IdentityAlreadyIncepted();
        case type === KeyEventType.ROTATE && this._keyEventLog.length === 0:
          return errors.IdentityNotIncepted();
        case (type === KeyEventType.ROTATE || type === KeyEventType.INCEPT) && !nextKeyPairs:
          return errors.InvalidKeyPairs();
      }

      if (this._keyEventLog.length > 0 && this._keyEventLog[this._keyEventLog.length - 1].type === KeyEventType.DESTROY) {
        return errors.IdentityDestroyed();
      }

      if (type === KeyEventType.INCEPT && this._keyEventLog.length > 0) {
        return errors.IdentityAlreadyIncepted();
      }

      const keyPairs = this._spark.keyPairs as KeyPairs;
      if (keyPairs instanceof SparkError) throw keyPairs;

      // if it's not inception, check that this key matches the previous commitment
      if (type !== KeyEventType.INCEPT) {
        const previousKeyCommitment = this._keyEventLog[this._keyEventLog.length - 1].nextKeyCommitments;
        const keyCommitment = await this._spark.hash(keyPairs?.signing?.publicKey);
        if (keyCommitment instanceof SparkError) throw keyCommitment;
        if (previousKeyCommitment !== keyCommitment) {
          return errors.InvalidKeyCommitment();
        }
      }

      const nextKeyCommitments = type === KeyEventType.DESTROY ? undefined  : await this._spark.hash(nextKeyPairs?.signing?.publicKey);
      if (nextKeyCommitments instanceof SparkError) throw nextKeyCommitments;

      const baseEventProps: BaseKeyEventProps = {
        index: this._keyEventLog.length,
        signingThreshold: 1,
        signingKeys: [keyPairs.signing.publicKey],
        backerThreshold: 1,
        backers: [...backers],
        nextKeyCommitments,
      }

      const eventJSON = JSON.stringify(baseEventProps);
      const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';

      const hashedEvent = await this._spark.hash(eventJSON);
      if (hashedEvent instanceof SparkError) throw hashedEvent;

      const selfAddressingIdentifier = await this._spark.seal({ data: hashedEvent });
      if (selfAddressingIdentifier instanceof SparkError) throw selfAddressingIdentifier;

      const identifier = this._identifier || `B${selfAddressingIdentifier}`;
      const previousEventDigest: string = this._keyEventLog.length > 0 ? this._keyEventLog[this._keyEventLog.length - 1].selfAddressingIdentifier : undefined;

      const commonEventProps: CommonKeyEventProps = {
        identifier,
        type,
        version,
        ...baseEventProps,
        selfAddressingIdentifier,
      }

      switch (type) {
        case KeyEventType.INCEPT:
          return {
            ...commonEventProps,
            type: KeyEventType.INCEPT,
          } as KeyInceptionEvent;

        case KeyEventType.ROTATE:
          return {
            ...commonEventProps,
            type: KeyEventType.ROTATE,
            previousEventDigest,
          } as KeyRotationEvent;

        case KeyEventType.DESTROY:
          return {
            ...commonEventProps,
            type: KeyEventType.DESTROY,
            previousEventDigest,
            nextKeyCommitments: [],
            signingKeys: []
          } as KeyDestructionEvent;

        default:
          throw errors.InvalidKeyEventType();
      }

    } catch (error) {
      if (error instanceof SparkError) return error;
      return new SparkError({
        type: ControllerErrorType.KEY_EVENT_ERROR,
        message: `key event failed: ${error.message}` as ErrorMessage,
        metadata: { keyEventType: type },
      });
    }
  }

  public async incept(nextKeyPairs: KeyPairs): ReturnType<ControllerInterface['incept']> {
    const inceptionEvent = await this.keyEvent({ nextKeyPairs, type: KeyEventType.INCEPT, backers: [] }) as KeyInceptionEvent;
    if (inceptionEvent instanceof SparkError) return inceptionEvent as ErrorInterface;
    this._keyEventLog.push(inceptionEvent);
    this._identifier = inceptionEvent.identifier;
  }

  public async rotate(nextKeyPairs: KeyPairs): ReturnType<ControllerInterface['rotate']> {
    const rotationEvent = await this.keyEvent({ nextKeyPairs, type: KeyEventType.ROTATE, backers: [] }) as KeyRotationEvent;
    if (rotationEvent instanceof SparkError) return rotationEvent as ErrorInterface;
    this._keyEventLog.push(rotationEvent);
  }

  public async destroy(): ReturnType<ControllerInterface['destroy']> {
    const destructionEvent = await this.keyEvent({ type: KeyEventType.DESTROY, backers: [] }) as KeyDestructionEvent;
    if (destructionEvent instanceof SparkError) return destructionEvent as ErrorInterface;
    this._keyEventLog.push(destructionEvent);
  }
}