import { AnyKeyEvent, BaseKeyEventProps, KeyDestructionEvent, KeyEventType, KeyInceptionEvent, KeyRotationEvent } from '../SparkController/types';
import { SparkController } from "../SparkController";
import { KeyPairs } from '../../spark/types';
import { SparkErrors } from '../../errors';
import { ControllerErrors } from '../../errors/controllers';
import { SparkEvent } from '../../events/SparkEvent';

export class Basic extends SparkController {
  public async import(data: Record<string, any>): Promise<void> {
    await super.import(data);
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    return Promise.resolve(data);
  }

  private async keyEvent({ nextKeyPairs, type }: { nextKeyPairs?: KeyPairs, type: KeyEventType.INCEPT }): Promise<KeyInceptionEvent>;
  private async keyEvent({ nextKeyPairs, type }: { nextKeyPairs?: KeyPairs, type: KeyEventType.ROTATE }): Promise<KeyRotationEvent>;
  private async keyEvent({ nextKeyPairs, type }: { nextKeyPairs?: KeyPairs, type: KeyEventType.DESTROY }): Promise<KeyDestructionEvent>;
  private async keyEvent({ nextKeyPairs, type }: { nextKeyPairs?: KeyPairs, type: KeyEventType }): Promise<AnyKeyEvent> {
    const keyPairs = this._spark.keyPairs as KeyPairs;
    const previousKeyCommitment = this.keyEventLog[this.keyEventLog.length - 1]?.nextKeyCommitments;
    const keyCommitment = await this._spark.hash({ data: keyPairs.signer.publicKey });
    const nextKeyCommitments = type === KeyEventType.DESTROY ? undefined : await this._spark.hash({ data: nextKeyPairs?.signer.publicKey });

    try {
      switch (true) {
        case type === KeyEventType.INCEPT && this.keyEventLog.length > 0:
          throw ControllerErrors.CONTROLLER_ALREADY_INCEPTED_ERROR();
        case type === KeyEventType.ROTATE && this.keyEventLog.length === 0:
        case type === KeyEventType.DESTROY && this.keyEventLog.length === 0:
          throw ControllerErrors.CONTROLLER_INCEPTION_MISSING_ERROR();
        case type === KeyEventType.DESTROY && this.keyEventLog.length > 0 && this.keyEventLog[this.keyEventLog.length - 1].type === KeyEventType.DESTROY:
          throw ControllerErrors.CONTROLLER_ALREADY_DESTROYED_ERROR();
        case type !== KeyEventType.DESTROY && !nextKeyPairs:
          throw ControllerErrors.CONTROLLER_INVALID_NEXT_KEYPAIRS_ERROR();
        case !Object.values(KeyEventType).includes(type):
          throw ControllerErrors.CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR();
        case type === KeyEventType.ROTATE && previousKeyCommitment !== keyCommitment:
          throw ControllerErrors.CONTROLLER_INVALID_NEXT_KEY_COMMITMENT_ERROR();
        case this.keyEventLog.length > 0 && !this.keyEventLog[this.keyEventLog.length - 1].selfAddressingIdentifier:
          throw ControllerErrors.CONTROLLER_MISSING_PREVIOUS_DIGEST_ERROR();
      }

      const baseEventProps: BaseKeyEventProps = {
        index: this.keyEventLog.length,
        signingThreshold: 1,
        signingKeys: [keyPairs.signer.publicKey],
        backerThreshold: 0,
        backers: [],
        nextKeyCommitments,
      }

      const eventJSON = JSON.stringify(baseEventProps);
      const versionData = eventJSON.length.toString(16).padStart(6, '0');
      const version = 'KERI10JSON' + versionData + '_';
      const hashedEvent = await this._spark.hash({ data: eventJSON });
      const selfAddressingIdentifier = await this._spark.seal({ data: hashedEvent });
      const identifier = this._identifier || `B${selfAddressingIdentifier}`;
      const previousEventDigest = this.keyEventLog[this.keyEventLog.length - 1]?.selfAddressingIdentifier;

      const commonEventProps = {
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
          };
        case KeyEventType.ROTATE:
          return {
            ...commonEventProps,
            type: KeyEventType.ROTATE,
            previousEventDigest,
          };
        case KeyEventType.DESTROY:
          return {
            ...commonEventProps,
            type: KeyEventType.DESTROY,
            previousEventDigest,
            nextKeyCommitments: [],
            signingKeys: []
          };
        default:
          throw ControllerErrors.CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR();
      }
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(ControllerErrors.CONTROLLER_UNEXPECTED_ERROR({
        message: `Failed to create key event. ${error?.message || ''}`,
      }));
    }
  }

  public async incept(): Promise<void> {
    try {
      const keyPairs = this._spark.keyPairs as KeyPairs;
      const inceptionEvent = await this.keyEvent({ nextKeyPairs: keyPairs, type: KeyEventType.INCEPT }) as KeyInceptionEvent;
      this.keyEventLog.push(inceptionEvent);
      this._identifier = inceptionEvent.identifier;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async rotate({ nextKeyPairs }: { nextKeyPairs: KeyPairs }): Promise<void> {
    try {
      const rotationEvent = await this.keyEvent({ nextKeyPairs, type: KeyEventType.ROTATE }) as KeyRotationEvent;
      this.keyEventLog.push(rotationEvent);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async destroy(): Promise<void> {
    try {
      const destructionEvent = await this.keyEvent({ type: KeyEventType.DESTROY }) as KeyDestructionEvent;
      this.keyEventLog.push(destructionEvent);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}