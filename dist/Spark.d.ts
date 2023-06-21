import { Controller, EncryptionKeyPair, Identifier, KeyEventLog, KeyPairs, PublicKeys, SigningKeyPair } from './controllers/index';
import { Agent } from './agents/index';
import { Signer } from './signers/index';
import { Cipher } from './ciphers/index';
import { Hasher } from './hashers/index';
interface Constructable<T> {
    new (...args: any[]): T;
}
type SparkOptions<C extends Controller, S extends Signer, Cp extends Cipher, H extends Hasher, A extends Agent[]> = {
    controller: Constructable<C>;
    signer: Constructable<S>;
    cipher: Constructable<Cp>;
    hasher: Constructable<H>;
    agents: Constructable<A[number]>[];
};
export interface ISpark<C extends Controller, S extends Signer, Cp extends Cipher, H extends Hasher, A extends Agent[]> {
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
export declare class Spark<C extends Controller, S extends Signer, Cp extends Cipher, H extends Hasher, A extends Agent[]> implements ISpark<C, S, Cp, H, A> {
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
}
export {};
