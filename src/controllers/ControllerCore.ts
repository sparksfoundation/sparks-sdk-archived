import { Identifier, KeyEventLog } from "./types";
import { Spark } from "../Spark";
import { ControllerErrors } from "../errors/controller";

export abstract class ControllerCore {
  protected _identifier: Identifier;
  protected _keyEventLog: KeyEventLog;
  protected _spark: Spark<any, any, any, any, any>;

  constructor(spark: Spark<any, any, any, any, any>) {
    this._spark = spark;
    this._keyEventLog = [];
    this.getIdentifier = this.getIdentifier.bind(this);
    this.getKeyEventLog = this.getKeyEventLog.bind(this);
    this.incept = this.incept.bind(this);
    this.rotate = this.rotate.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  public async import(data: Record<string, any>): Promise<void> {
    this._identifier = data.identifier;
    this._keyEventLog = data.keyEventLog;
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({
      identifier: this._identifier,
      keyEventLog: this._keyEventLog,
    });
  }

  public getIdentifier(): Identifier {
    try {
      if (!this._identifier) throw new Error('No identifier found.');
      return this._identifier;
    } catch(error) {
      throw ControllerErrors.GetIdentifierError(error)
    }
  }

  public getKeyEventLog(): KeyEventLog {
    try {
      if (!this._keyEventLog) throw new Error('No key event log found.');
      return this._keyEventLog;
    } catch(error) {
      throw ControllerErrors.GetKeyEventLogError(error)
    }
  }

  public abstract incept(params?: Record<string, any>): Promise<void>;
  public abstract rotate(params?: Record<string, any>): Promise<void>;
  public abstract destroy(params?: Record<string, any>): Promise<void>;
}