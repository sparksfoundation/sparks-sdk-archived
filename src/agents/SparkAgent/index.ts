import { SparkErrors } from "../../errors";
import { SparkInterface } from "../../spark/types";
import { SparkAgentInterface } from "./types";

export abstract class SparkAgent implements SparkAgentInterface {
  protected _spark: SparkInterface<any, any, any, any, any>;
  
  constructor(spark: SparkInterface<any, any, any, any, any>) {
    this._spark = spark;
  }

  public async import(data: Record<string, any>): Promise<void> {
    if (!data) throw SparkErrors.SPARK_IMPORT_ERROR();
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}