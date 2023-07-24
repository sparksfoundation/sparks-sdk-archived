import { SparkErrors } from "../../errors";
import { SparkAgentInterface } from "./types";

export abstract class SparkAgent implements SparkAgentInterface {
  public async import(data: Record<string, any>): Promise<void> {
    if (!data) throw SparkErrors.SPARK_IMPORT_ERROR();
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}