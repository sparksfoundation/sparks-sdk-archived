"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Basic = void 0;
var _types = require("../types.cjs");
var _CoreController = require("../CoreController.cjs");
var _controller = require("../../errors/controller.cjs");
class Basic extends _CoreController.CoreController {
  async import(data) {
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    return Promise.resolve(data);
  }
  async keyEvent({
    nextKeyPairs,
    type
  }) {
    const keyPairs = this._spark.keyPairs;
    const previousKeyCommitment = this._keyEventLog[this._keyEventLog.length - 1]?.nextKeyCommitments;
    const keyCommitment = await this._spark.hash({
      data: keyPairs.signer.publicKey
    });
    const nextKeyCommitments = type === _types.KeyEventType.DESTROY ? void 0 : await this._spark.hash({
      data: nextKeyPairs.signer.publicKey
    });
    try {
      switch (true) {
        case type === _types.KeyEventType.INCEPT && this._keyEventLog.length > 0:
          throw new Error("Cannot incept when already incepted.");
        case type === _types.KeyEventType.ROTATE && this._keyEventLog.length === 0:
          throw new Error("Cannot rotate when not incepted.");
        case type === _types.KeyEventType.DESTROY && this._keyEventLog.length === 0:
          throw new Error("Cannot destroy when not incepted.");
        case type === _types.KeyEventType.DESTROY && this._keyEventLog.length > 0 && this._keyEventLog[this._keyEventLog.length - 1].type === _types.KeyEventType.DESTROY:
          throw new Error("Cannot destroy when already destroyed.");
        case type !== _types.KeyEventType.DESTROY && !nextKeyPairs:
          throw new Error("Invalid next key pairs.");
        case !Object.values(_types.KeyEventType).includes(type):
          throw new Error("Invalid key event type.");
        case type === _types.KeyEventType.ROTATE && previousKeyCommitment !== keyCommitment:
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
      const hashedEvent = await this._spark.hash({
        data: eventJSON
      });
      const selfAddressingIdentifier = await this._spark.seal({
        data: hashedEvent
      });
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
        case _types.KeyEventType.INCEPT:
          return {
            ...commonEventProps,
            type: _types.KeyEventType.INCEPT
          };
        case _types.KeyEventType.ROTATE:
          return {
            ...commonEventProps,
            type: _types.KeyEventType.ROTATE,
            previousEventDigest
          };
        case _types.KeyEventType.DESTROY:
          return {
            ...commonEventProps,
            type: _types.KeyEventType.DESTROY,
            previousEventDigest,
            nextKeyCommitments: [],
            signingKeys: []
          };
        default:
          throw new Error("Invalid key event type.");
      }
    } catch (error) {
      return Promise.reject(_controller.ControllerErrors.KeyEventCreationError(error));
    }
  }
  async incept() {
    try {
      const keyPairs = this._spark.keyPairs;
      const inceptionEvent = await this.keyEvent({
        nextKeyPairs: keyPairs,
        type: _types.KeyEventType.INCEPT
      });
      this._keyEventLog.push(inceptionEvent);
      this._identifier = inceptionEvent.identifier;
    } catch (error) {
      return Promise.reject(_controller.ControllerErrors.InceptionError(error));
    }
  }
  async rotate({
    nextKeyPairs
  }) {
    try {
      const rotationEvent = await this.keyEvent({
        nextKeyPairs,
        type: _types.KeyEventType.ROTATE
      });
      this._keyEventLog.push(rotationEvent);
    } catch (error) {
      return Promise.reject(_controller.ControllerErrors.RotationError(error));
    }
  }
  async destroy() {
    try {
      const destructionEvent = await this.keyEvent({
        type: _types.KeyEventType.DESTROY
      });
      this._keyEventLog.push(destructionEvent);
    } catch (error) {
      return Promise.reject(_controller.ControllerErrors.DestroyError(error));
    }
  }
}
exports.Basic = Basic;