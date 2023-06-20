import { Controller, EncryptionKeyPair, Identifier, KeyEventLog, KeyPairs, PublicKeys, SigningKeyPair } from './controllers/index';
import { Agent } from './agents/index';
import { Signer } from './signers/index';
import { Cipher } from './ciphers/index';
import { Hasher } from './hashers/index';
interface Constructable<T> {
    new (...args: any): T;
}
type SparkOptions = {
    controller: Constructable<Controller>;
    signer: Constructable<Signer>;
    cipher: Constructable<Cipher>;
    hasher: Constructable<Hasher>;
    agents: Constructable<Agent>[];
};
export interface SparkI {
    identifier: Identifier;
    keyEventLog: KeyEventLog;
    publicKeys: PublicKeys;
    encryptionKeys: EncryptionKeyPair;
    signingKeys: SigningKeyPair;
    keyPairs: KeyPairs;
    hash: (data: any) => Promise<string> | never;
    sign: ({ data, detached }: {
        data: object | string;
        detached: boolean;
    }) => Promise<string> | never;
    verify: ({ publicKey, signature, data }: {
        publicKey: string;
        signature: string;
        data?: object | string;
    }) => Promise<boolean> | Promise<string | object | null> | never;
}
export declare class Spark implements SparkI {
    private cipher;
    private controller;
    private hasher;
    private signer;
    private agents;
    constructor(options: SparkOptions);
    get identifier(): Identifier;
    get keyEventLog(): KeyEventLog;
    get encryptionKeys(): EncryptionKeyPair;
    get signingKeys(): SigningKeyPair;
    get publicKeys(): PublicKeys;
    get keyPairs(): KeyPairs;
    sign(args: any): Promise<string> | never;
    verify(args: any): Promise<boolean> | Promise<string | object | null> | never;
    hash(args: any): Promise<string> | never;
    incept(args: any): Promise<void> | never;
    rotate(args: any): Promise<void> | never;
    delete(args: any): Promise<void> | never;
    encrypt(args: any): Promise<string> | never;
    decrypt(args: any): Promise<string | Record<string, any>> | never;
    import(args: any): Promise<void> | never;
    export(args?: any): Promise<string> | never;
    computeSharedKey(args: any): Promise<string> | never;
}
export {};
