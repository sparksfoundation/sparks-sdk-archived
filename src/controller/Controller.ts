import { ControllerErrorType, ControllerInterface, Identifier, KeyEvent, KeyEventBaseParams, KeyEventLog, KeyInceptionEvent, KeyRotationEvent } from "./types";
import { ErrorInterface, SparkError } from "../common/errors";
import errors from "./errorFactory";
import { KeyEventType } from "./types";
import { HasherAbstract } from "../hasher/types";
import { SignerAbstract } from "../signer/types";

export class Controller<H extends HasherAbstract, S extends SignerAbstract> implements ControllerInterface {
  private _identifier: Identifier;
  private _keyEventLog: KeyEventLog;
  private _hasher: H;
  private _signer: S;

  constructor({ hasher, signer }: { hasher: H, signer: S }) {
    this._hasher = hasher;
    this._signer = signer;
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

  private async newKeyEvent({ type }) {
    const baseParams: KeyEventBaseParams = {
      type,
      identifier: this.getIdentifier() as Identifier,
    }

  }

  public async incept({ keyPairs, nextKeyPairs, backers }: Parameters<ControllerInterface['incept']>[0]): ReturnType<ControllerInterface['incept']> {
    const inceptionEvent = await this.keyEvent({
      type: KeyEventType.INCEPT,
      keyPairs,
      nextKeyPairs,
      eventType: KeyEventType.INCEPT,
      backers: [...backers],
    }) as KeyInceptionEvent;

    if (inceptionEvent instanceof SparkError) {
      return inceptionEvent;
    }

    const { identifier } = inceptionEvent;
    this._identifier = identifier;
    this._keyEventLog.push(inceptionEvent);
  }

  public rotate({ keyPairs, nextKeyPairs, backers }: Parameters<ControllerInterface['rotate']>[0]): ReturnType<ControllerInterface['rotate']> {
    return Promise.reject(new SparkError({
      message: 'Not implemented',
      type: ControllerErrorType.INVALID_IDENTIFIER,
    }))
  }

  public destroy({ keyPairs, nextKeyPairs, backers }: Parameters<ControllerInterface['destroy']>[0]): ReturnType<ControllerInterface['destroy']> {
    return Promise.reject(new SparkError({
      message: 'Not implemented',
      type: ControllerErrorType.INVALID_IDENTIFIER,
    }))
  }

  private async keyEvent(args): Promise<KeyEvent | ErrorInterface> {
    try {
      const { type, backers = [] } = args || {};
      const { keyPairs, nextKeyPairs } = (args || {});
      const lastEvent = this._keyEventLog[this._keyEventLog.length - 1];
      const keyHash = keyPairs ? await this._hasher.hash(keyPairs.signing.publicKey) : null;
      const hasKeyPairs = !!keyPairs && !!nextKeyPairs;
      const isIncepted = !!this._identifier || !!this._keyEventLog?.length;
      const isDeleted = lastEvent?.type as KeyEventType === KeyEventType.DESTROY;
      const isValidCommit = keyHash === lastEvent?.nextKeyCommitments[0];

      if (type === KeyEventType.INCEPT) {
        if (isIncepted) throw new Error('Identity already incepted')
        if (!hasKeyPairs) throw new Error('Current and next key pairs required for inception')
      } else if (type === KeyEventType.ROTATE) {
        if (!isIncepted) throw Error('Keys can not be rotated before inception');
        if (!hasKeyPairs) throw new Error('Current and next key pairs required for rotation')
        if (isDeleted) throw new Error('Keys can not be rotated after destruction');
        if (!isValidCommit) throw new Error('Key commitment does not match the current key commitment');
      } else if (type === KeyEventType.DESTROY) {
        if (isDeleted) throw new Error('Identity has already been deleted');
      }

      const index = this._keyEventLog.length
      const nextKeyCommitments = type === KeyEventType.DESTROY ? [] : [await this._hasher.hash(nextKeyPairs.signing.publicKey)];
      const signingKeys = type === KeyEventType.DESTROY ? [] : [keyPairs.signing.publicKey];

      const event = {
        index,
        type,
        signingThreshold: 1,
        signingKeys,
        nextKeyCommitments,
        backerThreshold: 1,
        backers,
      };

      const eventJSON = JSON.stringify(event);
      const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
      const hashedEvent = await this._hasher.hash(eventJSON);
      const signedEventHash = await this._signer.sign({ data: hashedEvent, detached: true });
      const identifier = this._identifier || `B${signedEventHash}`;

      if (type === KeyEventType.ROTATE) {
        const previousEventDigest: string = this._keyEventLog[this._keyEventLog.length - 1].selfAddressingIdentifier;
        if (!previousEventDigest) throw new Error('Previous event digest not found');
        (event as KeyRotationEvent).previousEventDigest = previousEventDigest;
      }

      const keyEvent = {
        ...event,
        identifier: identifier,
        selfAddressingIdentifier: signedEventHash,
        version: version,
      };

      return keyEvent as KeyEvent;
    } catch (error) {
      return errors.KeyEventError(error.message);
    }
  }
}