import { ICipher } from './types.js';

export class Cipher implements ICipher {
  protected spark: any;
  constructor(spark) {
    this.spark = spark;
  }
  
  async encrypt(args: any) {
    throw new Error('Not implemented');
    return '';
  }

  async decrypt(args: any): Promise<Record<string, any> | null> {
    throw new Error('Not implemented');
    return null;
  }

  async sharedKey(args: any) {
    throw new Error('Not implemented');
    return '';
  }
}