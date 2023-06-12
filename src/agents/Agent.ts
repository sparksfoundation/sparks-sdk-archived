import { IAgent } from './types.js';

export class Agent implements IAgent {
  protected spark: any; // TODO define spark interface
  constructor(spark: any) {
    this.spark = spark;
  }
}