import { ICipher } from './types';

export class Cipher implements ICipher {
  protected spark: any;
  constructor(spark) {
    this.spark = spark;
    if (!this.spark) throw new Error('Channel: missing spark');
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