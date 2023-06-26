import { ControllerType, Identifier, KeyEventLog } from "./types";
import { ErrorInterface } from "../common/errors";
import { SparkInterface } from "../types";
import { ControllerErrorFactory } from "./errorFactory";
import { Spark } from "../Spark";
const errors = new ControllerErrorFactory(ControllerType.CORE_CONTROLLER);

export abstract class ControllerAbstract {
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

  public getIdentifier(): Identifier | ErrorInterface {
    return this._identifier ? this._identifier : errors.InvalidIdentifier();
  }

  public getKeyEventLog(): KeyEventLog | ErrorInterface {
    return this._keyEventLog ? this._keyEventLog : errors.InvalidKeyEventLog();
  }

  public abstract incept(args: any): Promise<void | ErrorInterface>;
  public abstract rotate(args: any): Promise<void | ErrorInterface>;
  public abstract destroy(args: any): Promise<void | ErrorInterface>;
}