import { ISpark } from '../../Spark';
import { ICipher } from './types';

export class Cipher implements ICipher {
  protected spark: ISpark<any, any, any, any, any>;
  
  constructor(spark: ISpark<any, any, any, any, any>) {
    this.spark = spark;
    if (!this.spark) throw new Error('Cipher: missing spark');
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
  }
  
  async encrypt(args: any) {
    throw new Error('Not implemented');
    return '';
  }

  async decrypt(args: any): Promise<Record<string, any> | null> {
    throw new Error('Not implemented');
    return null;
  }

  async computeSharedKey(args: any) {
    throw new Error('Not implemented');
    return '';
  }
}