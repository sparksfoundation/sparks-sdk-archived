import { Spark } from '../../Spark';
import { DeletionArgs, EncryptionKeyPair, IController, Identifier, InceptionArgs, KeriEventArgs, KeriKeyEvent, KeriRotationEvent, KeyPairs, PublicKeys, RotationArgs, SecretKeys, SigningKeyPair } from './types';
export declare class Controller implements IController {
    protected _identifier: Identifier;
    protected _keyPairs: KeyPairs;
    protected _keyEventLog: KeriKeyEvent[];
    protected spark: Spark;
    constructor(spark: Spark);
    get identifier(): Identifier;
    get keyEventLog(): KeriKeyEvent[];
    get keyPairs(): KeyPairs;
    get encryptionKeys(): EncryptionKeyPair;
    get signingKeys(): SigningKeyPair;
    get secretKeys(): SecretKeys;
    get publicKeys(): PublicKeys;
    incept(args: InceptionArgs): Promise<void>;
    rotate(args: RotationArgs): Promise<void>;
    delete(args: DeletionArgs): Promise<void>;
    protected keyEvent(args: KeriEventArgs): Promise<import("./types").KeriInceptionEvent | KeriRotationEvent>;
    import({ keyPairs, data }: {
        keyPairs: any;
        data: any;
    }): Promise<void>;
    export(args?: any): Promise<any>;
}
