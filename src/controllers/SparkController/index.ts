import { SparkErrors } from "../../errors";
import { SparkInterface } from "../../spark/types";
import { Identifier, KeyEventLog, SparkControllerInterface } from "./types";

export abstract class SparkController implements SparkControllerInterface {
  protected _spark: SparkInterface<any, any, any, any, any>;
  protected _identifier: Identifier;
  protected _keyEventLog: KeyEventLog;

  constructor(spark: SparkInterface<any, any, any, any, any>) {
    this._spark = spark;
    this._keyEventLog = [];
    this.incept = this.incept.bind(this);
    this.rotate = this.rotate.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  public get identifier(): Identifier {
    return this._identifier;
  }

  public get keyEventLog(): KeyEventLog {
    return this._keyEventLog;
  }

  public async import(data: Record<string, any>): Promise<void> {
    if (data?.identifier && data?.keyEventLog) {
      this._identifier = data.identifier;
      this._keyEventLog = data.keyEventLog;
    }
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({
      identifier: this._identifier,
      keyEventLog: this._keyEventLog,
    });
  }

  public abstract incept(params?: Record<string, any>): Promise<void>;
  public abstract rotate(params?: Record<string, any>): Promise<void>;
  public abstract destroy(params?: Record<string, any>): Promise<void>;
}