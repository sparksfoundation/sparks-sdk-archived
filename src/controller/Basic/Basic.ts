import { BaseKeyEventProps, CommonKeyEventProps, ControllerErrorType, ControllerType, KeyDestructionEvent, KeyEvent, KeyInceptionEvent, KeyRotationEvent } from "../types";
import { ErrorInterface, ErrorMessage, SparkError } from "../../common/errors";
import { KeyEventType } from "../types";
import { ControllerAbstract } from "../ControllerCore";
import { KeyPairs } from "../../types";
import { ControllerErrorFactory } from "../errorFactory";
const errors = new ControllerErrorFactory(ControllerType.BASIC_CONTROLLER);

export class Basic extends ControllerAbstract {
  private async keyEvent({ nextKeyPairs, type }: { nextKeyPairs?: KeyPairs, type: KeyEventType }): Promise<KeyEvent | ErrorInterface> {
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
      if (SparkError.is(keyPairs)) {
        return keyPairs as ErrorInterface;
      }

      // if it's not inception, check that this key matches the previous commitment
      if (type === KeyEventType.ROTATE) {
        const previousKeyCommitment = this._keyEventLog[this._keyEventLog.length - 1].nextKeyCommitments;
        const keyCommitment = await this._spark.hash({ data: keyPairs.signing.publicKey });
        if (SparkError.is(keyCommitment)) throw keyCommitment;
        if (previousKeyCommitment !== keyCommitment) {
          return errors.InvalidKeyCommitment();
        }
      }

      const nextKeyCommitments = type === KeyEventType.DESTROY ? undefined  : await this._spark.hash({ data: nextKeyPairs.signing.publicKey });
      if (SparkError.is(nextKeyCommitments)) throw nextKeyCommitments;

      const baseEventProps: BaseKeyEventProps = {
        index: this._keyEventLog.length,
        signingThreshold: 1,
        signingKeys: [keyPairs.signing.publicKey],
        backerThreshold: 0,
        backers: [],
        nextKeyCommitments,
      }

      const eventJSON = JSON.stringify(baseEventProps);
      const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';

      const hashedEvent = await this._spark.hash({ data: eventJSON });
      if (SparkError.is(hashedEvent)) throw hashedEvent;

      const selfAddressingIdentifier = await this._spark.seal({ data: hashedEvent });
      if (SparkError.is(selfAddressingIdentifier)) throw selfAddressingIdentifier;

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
      if (SparkError.is(error)) return error;
      return new SparkError({
        type: ControllerErrorType.KEY_EVENT_ERROR,
        message: `key event failed: ${error.message}` as ErrorMessage,
        metadata: { keyEventType: type },
      });
    }
  }

  public async incept({ keyPairs }: { keyPairs: KeyPairs }): Promise<void | ErrorInterface> {
    const inceptionEvent = await this.keyEvent({ nextKeyPairs: keyPairs, type: KeyEventType.INCEPT }) as KeyInceptionEvent;
    if (SparkError.is(inceptionEvent)) return inceptionEvent as ErrorInterface;
    this._keyEventLog.push(inceptionEvent);
    this._identifier = inceptionEvent.identifier;
  }

  public async rotate({ nextKeyPairs }: { nextKeyPairs: KeyPairs }): Promise<void | ErrorInterface> {
    const rotationEvent = await this.keyEvent({ nextKeyPairs, type: KeyEventType.ROTATE }) as KeyRotationEvent;
    if (SparkError.is(rotationEvent)) return rotationEvent as ErrorInterface;
    this._keyEventLog.push(rotationEvent);
  }

  public async destroy(): Promise<void | ErrorInterface> {
    const destructionEvent = await this.keyEvent({ type: KeyEventType.DESTROY }) as KeyDestructionEvent;
    if (SparkError.is(destructionEvent)) return destructionEvent as ErrorInterface;
    this._keyEventLog.push(destructionEvent);
  }
}