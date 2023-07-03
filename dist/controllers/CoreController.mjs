import { ControllerErrors } from "../errors/controller.mjs";
export class CoreController {
  constructor(spark) {
    this._spark = spark;
    this._keyEventLog = [];
    this.getIdentifier = this.getIdentifier.bind(this);
    this.getKeyEventLog = this.getKeyEventLog.bind(this);
    this.incept = this.incept.bind(this);
    this.rotate = this.rotate.bind(this);
    this.destroy = this.destroy.bind(this);
  }
  async import(data) {
    this._identifier = data.identifier;
    this._keyEventLog = data.keyEventLog;
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({
      identifier: this._identifier,
      keyEventLog: this._keyEventLog
    });
  }
  getIdentifier() {
    try {
      if (!this._identifier)
        throw new Error("No identifier found.");
      return this._identifier;
    } catch (error) {
      throw ControllerErrors.GetIdentifierError(error);
    }
  }
  getKeyEventLog() {
    try {
      if (!this._keyEventLog)
        throw new Error("No key event log found.");
      return this._keyEventLog;
    } catch (error) {
      throw ControllerErrors.GetKeyEventLogError(error);
    }
  }
}
