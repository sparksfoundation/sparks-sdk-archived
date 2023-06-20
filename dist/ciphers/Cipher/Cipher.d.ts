import { ICipher } from './types';
export declare class Cipher implements ICipher {
    protected spark: any;
    constructor(spark: any);
    encrypt(args: any): Promise<string>;
    decrypt(args: any): Promise<Record<string, any> | null>;
    computeSharedKey(args: any): Promise<string>;
}
