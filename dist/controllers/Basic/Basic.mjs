import { KeyEventType } from "../types.mjs";
import { CoreController } from "../CoreController.mjs";
import { ControllerErrors } from "../../errors/controller.mjs";
export class Basic extends CoreController {
  async import(data) {
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    return Promise.resolve(data);
  }
  async keyEvent({ nextKeyPairs, type }) {
    const keyPairs = this._spark.keyPairs;
    const previousKeyCommitment = this._keyEventLog[this._keyEventLog.length - 1]?.nextKeyCommitments;
    const keyCommitment = await this._spark.hash({ data: keyPairs.signer.publicKey });
    const nextKeyCommitments = type === KeyEventType.DESTROY ? void 0 : await this._spark.hash({ data: nextKeyPairs.signer.publicKey });
    try {
      switch (true) {
        case (type === KeyEventType.INCEPT && this._keyEventLog.length > 0):
          throw new Error("Cannot incept when already incepted.");
        case (type === KeyEventType.ROTATE && this._keyEventLog.length === 0):
          throw new Error("Cannot rotate when not incepted.");
        case (type === KeyEventType.DESTROY && this._keyEventLog.length === 0):
          throw new Error("Cannot destroy when not incepted.");
        case (type === KeyEventType.DESTROY && this._keyEventLog.length > 0 && this._keyEventLog[this._keyEventLog.length - 1].type === KeyEventType.DESTROY):
          throw new Error("Cannot destroy when already destroyed.");
        case (type !== KeyEventType.DESTROY && !nextKeyPairs):
          throw new Error("Invalid next key pairs.");
        case !Object.values(KeyEventType).includes(type):
          throw new Error("Invalid key event type.");
        case (type === KeyEventType.ROTATE && previousKeyCommitment !== keyCommitment):
          throw new Error("Invalid next key commitment.");
      }
      const baseEventProps = {
        index: this._keyEventLog.length,
        signingThreshold: 1,
        signingKeys: [keyPairs.signer.publicKey],
        backerThreshold: 0,
        backers: [],
        nextKeyCommitments
      };
      const eventJSON = JSON.stringify(baseEventProps);
      const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
      const hashedEvent = await this._spark.hash({ data: eventJSON });
      const selfAddressingIdentifier = await this._spark.seal({ data: hashedEvent });
      const identifier = this._identifier || `B${selfAddressingIdentifier}`;
      const previousEventDigest = this._keyEventLog.length > 0 ? this._keyEventLog[this._keyEventLog.length - 1].selfAddressingIdentifier : void 0;
      const commonEventProps = {
        identifier,
        type,
        version,
        ...baseEventProps,
        selfAddressingIdentifier
      };
      switch (type) {
        case KeyEventType.INCEPT:
          return {
            ...commonEventProps,
            type: KeyEventType.INCEPT
          };
        case KeyEventType.ROTATE:
          return {
            ...commonEventProps,
            type: KeyEventType.ROTATE,
            previousEventDigest
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
          throw new Error("Invalid key event type.");
      }
    } catch (error) {
      return Promise.reject(ControllerErrors.KeyEventCreationError(error));
    }
  }
  async incept() {
    try {
      const keyPairs = this._spark.keyPairs;
      const inceptionEvent = await this.keyEvent({ nextKeyPairs: keyPairs, type: KeyEventType.INCEPT });
      this._keyEventLog.push(inceptionEvent);
      this._identifier = inceptionEvent.identifier;
    } catch (error) {
      return Promise.reject(ControllerErrors.InceptionError(error));
    }
  }
  async rotate({ nextKeyPairs }) {
    try {
      const rotationEvent = await this.keyEvent({ nextKeyPairs, type: KeyEventType.ROTATE });
      this._keyEventLog.push(rotationEvent);
    } catch (error) {
      return Promise.reject(ControllerErrors.RotationError(error));
    }
  }
  async destroy() {
    try {
      const destructionEvent = await this.keyEvent({ type: KeyEventType.DESTROY });
      this._keyEventLog.push(destructionEvent);
    } catch (error) {
      return Promise.reject(ControllerErrors.DestroyError(error));
    }
  }
}
