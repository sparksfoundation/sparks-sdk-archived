import { ControllerErrorType, ControllerInterface, Identifier, KeyDestructionEvent, KeyEventLog, KeyInceptionEvent, KeyRotationEvent } from "./types";
import { SparkError, ErrorInterface } from "../common/errors";
import errors from "./errorFactory";

export class Controller implements ControllerInterface {
  private _identifier: Identifier;
  private _keyEventLog: KeyEventLog;

  constructor() {
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

  public incept({ keyPairs, nextKeyPairs, backers }: Parameters<ControllerInterface['incept']>[0]): ReturnType<ControllerInterface['incept']> {
    console.log(keyPairs, nextKeyPairs, backers)
    return Promise.reject(new SparkError({
      message: 'Not implemented',
      type: ControllerErrorType.INVALID_IDENTIFIER,
    }))
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
}