import { ISpark } from '../../Spark';
import { IAgent } from './types';

export class Agent implements IAgent {
  protected spark: ISpark<any, any, any, any, any>; // TODO define spark interface
  constructor(spark: ISpark<any, any, any, any, any>) {
    if (!spark) throw new Error('Channel: missing spark');
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
  }
}