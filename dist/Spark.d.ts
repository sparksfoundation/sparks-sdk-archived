import { AController, EncryptionKeyPair, Identifier, KeyEventLog, KeyPairs, PublicKeys, SigningKeyPair } from './controllers/index';
import { ASigner } from './signers/index';
import { ACipher } from './ciphers/index';
import { AHasher } from './hashers/index';
import { AAgent } from './agents/Agent/types';
interface Constructable<T> {
    new (...args: any[]): T;
}
type SparkOptions<C extends AController, S extends ASigner, Cp extends ACipher, H extends AHasher, A extends AAgent[]> = {
    controller: Constructable<C>;
    signer: Constructable<S>;
    cipher: Constructable<Cp>;
    hasher: Constructable<H>;
    agents: Constructable<A[number]>[];
};
export interface ISpark<C extends AController, S extends ASigner, Cp extends ACipher, H extends AHasher, A extends AAgent[]> {
    identifier: Identifier;
    keyEventLog: KeyEventLog;
    publicKeys: PublicKeys;
    encryptionKeys: EncryptionKeyPair;
    signingKeys: SigningKeyPair;
    keyPairs: KeyPairs;
    agents: {
        [name: string]: InstanceType<Constructable<A[number]>>;
    };
    sign: S['sign'];
    verify: S['verify'];
    hash: H['hash'];
    encrypt: Cp['encrypt'];
    decrypt: Cp['decrypt'];
    computeSharedKey: Cp['computeSharedKey'];
    incept: C['incept'];
    rotate: C['rotate'];
    delete: C['delete'];
}
export declare class Spark<C extends AController, S extends ASigner, Cp extends ACipher, H extends AHasher, A extends AAgent[]> implements ISpark<C, S, Cp, H, A> {
    cipher: Cp;
    controller: C;
    hasher: H;
    signer: InstanceType<Constructable<S>>;
    agents: {
        [name: string]: InstanceType<Constructable<A[number]>>;
    };
    constructor(options: SparkOptions<C, S, Cp, H, A>);
    get identifier(): Identifier;
    get keyEventLog(): KeyEventLog;
    get encryptionKeys(): EncryptionKeyPair;
    get signingKeys(): SigningKeyPair;
    get publicKeys(): PublicKeys;
    get keyPairs(): KeyPairs;
    get sign(): S['sign'];
    get verify(): S['verify'];
    get hash(): H['hash'];
    get encrypt(): Cp['encrypt'];
    get decrypt(): Cp['decrypt'];
    get computeSharedKey(): Cp['computeSharedKey'];
    get incept(): C['incept'];
    get rotate(): C['rotate'];
    get delete(): C['delete'];
    get import(): C['import'];
    get export(): C['export'];
}
export {};
