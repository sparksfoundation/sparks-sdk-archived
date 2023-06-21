import { ISpark } from '../../Spark';
import { ICipher } from './types';
export declare class Cipher implements ICipher {
    protected spark: ISpark<any, any, any, any, any>;
    constructor(spark: ISpark<any, any, any, any, any>);
    encrypt(args: any): Promise<string>;
    decrypt(args: any): Promise<Record<string, any> | null>;
    computeSharedKey(args: any): Promise<string>;
}
