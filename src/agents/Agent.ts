import { Spark } from '../Spark.js';
import { IAgent } from './types.js';

export class Agent implements IAgent {
  protected spark: Spark; // TODO define spark interface
  constructor(spark: Spark) {
    if (!spark) throw new Error('Channel: missing spark');
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
  }
}