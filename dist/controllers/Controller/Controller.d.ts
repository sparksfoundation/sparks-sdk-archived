import { ISpark } from '../../Spark';
import { EncryptionKeyPair, IController, Identifier, KeriKeyEvent, KeyEventMethod, KeyPairs, PublicKeys, SecretKeys, SigningKeyPair } from './types';
export declare class Controller implements IController {
    protected spark: ISpark<any, any, any, any, any>;
    identifier: Identifier;
    keyPairs: KeyPairs;
    keyEventLog: KeriKeyEvent[];
    constructor(spark: ISpark<any, any, any, any, any>);
    get encryptionKeys(): EncryptionKeyPair;
    get signingKeys(): SigningKeyPair;
    get secretKeys(): SecretKeys;
    get publicKeys(): PublicKeys;
    incept({ keyPairs, nextKeyPairs, backers }: Parameters<IController['incept']>[0]): ReturnType<IController['incept']>;
    rotate({ keyPairs, nextKeyPairs, backers }: Parameters<IController['rotate']>[0]): ReturnType<IController['rotate']>;
    delete(args: Parameters<IController['delete']>[0]): ReturnType<IController['delete']>;
    protected keyEvent(args: Parameters<KeyEventMethod>[0]): ReturnType<KeyEventMethod>;
    import({ keyPairs, data }: Parameters<IController['import']>[0]): ReturnType<IController['import']>;
    export(): ReturnType<IController['export']>;
}
