import { ControllerErrorType, ControllerInterface, Identifier, KeyDestructionEvent, KeyEventLog, KeyInceptionEvent, KeyRotationEvent } from "./types";
import { SparkError, ErrorInterface } from "../common/errors";
import errors from "./errorFactory";

export class Controller implements ControllerInterface {
  private _identifier: Identifier;
  private _keyEventLog: KeyEventLog;

  public getIdentifier(): Identifier | ErrorInterface {
    return this._identifier ? this._identifier : errors.InvalidIdentifier();
  }

  public getKeyEventLog(): KeyEventLog | ErrorInterface {
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
    console.log(keyPairs, nextKeyPairs, backers)
    return Promise.reject(new SparkError({
      message: 'Not implemented',
      type: ControllerErrorType.INVALID_IDENTIFIER,
    }))
  }

  public destroy({ keyPairs, nextKeyPairs, backers }: Parameters<ControllerInterface['destroy']>[0]): ReturnType<ControllerInterface['destroy']> {
    console.log(keyPairs, nextKeyPairs, backers)
    return Promise.reject(new SparkError({
      message: 'Not implemented',
      type: ControllerErrorType.INVALID_IDENTIFIER,
    }))
  }
}