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

  async decrypt(args: any) {
    throw new Error('Not implemented');
    return '';
  }

  async shareKey(args: any) {
    throw new Error('Not implemented');
    return '';
  }
}