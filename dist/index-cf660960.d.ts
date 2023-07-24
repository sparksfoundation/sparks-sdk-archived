import { S as SparkAgentInterface } from './types-d473a34c.js';
import { S as SparkCipherInterface } from './types-188a9fde.js';
import { S as SparkControllerInterface, a as SparkInterface, c as SignedEncryptedData } from './types-c76b4006.js';
import { S as SparkHasherInterface } from './types-40269ceb.js';
import { f as SparkSignerInterface } from './types-14ae8009.js';

type Constructable<T> = new (...args: any[]) => T;
type Nullable<T> = T | null;
type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}` ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}` : Lowercase<S>;

declare class Spark<Agents extends SparkAgentInterface[], Cipher extends SparkCipherInterface, Controller extends SparkControllerInterface, Hasher extends SparkHasherInterface, Signer extends SparkSignerInterface> implements SparkInterface<Agents, Cipher, Controller, Hasher, Signer> {
    readonly agents: {
        [key: string]: Agents[number];
    };
    readonly cipher: Cipher;
    readonly controller: Controller;
    readonly hasher: Hasher;
    readonly signer: Signer;
    constructor({ agents, cipher, controller, hasher, signer }: {
        agents?: Constructable<Agents[number]>[];
        cipher: Constructable<Cipher>;
        controller: Constructable<Controller>;
        hasher: Constructable<Hasher>;
        signer: Constructable<Signer>;
    });
    get identifier(): Controller['identifier'];
    get publicKeys(): {
        cipher: Cipher['publicKey'];
        signer: Signer['publicKey'];
    };
    get secretKeys(): {
        cipher: Cipher['secretKey'];
        signer: Signer['secretKey'];
    };
    get keyPairs(): {
        signer: Signer['keyPair'];
        cipher: Cipher['keyPair'];
    };
    get keyEventLog(): Controller['keyEventLog'];
    private _generateKeyPairs;
    private _setKeyPairs;
    import: {
        (params: Parameters<Cipher['generateKeyPair']>[0] & Parameters<Signer['generateKeyPair']>[0] & {
            data: SignedEncryptedData;
        }): Promise<void>;
        (params: {
            cipher: Parameters<Cipher['generateKeyPair']>[0];
            signer: Parameters<Signer['generateKeyPair']>[0];
            data: SignedEncryptedData;
        }): Promise<void>;
    };
    export: SparkInterface<Agents, Cipher, Controller, Hasher, Signer>['export'];
    incept: {
        (params: Parameters<Cipher['generateKeyPair']>[0] & Parameters<Signer['generateKeyPair']>[0]): Promise<void>;
        (params: {
            cipher: Parameters<Cipher['generateKeyPair']>[0];
            signer: Parameters<Signer['generateKeyPair']>[0];
        }): Promise<void>;
        (): Promise<void>;
    };
    rotate: {
        (params: Parameters<Cipher['generateKeyPair']>[0] & Parameters<Signer['generateKeyPair']>[0]): Promise<void>;
        (params: {
            cipher: Parameters<Cipher['generateKeyPair']>[0];
            signer: Parameters<Signer['generateKeyPair']>[0];
        }): Promise<void>;
    };
    destroy: SparkInterface<Agents, Cipher, Controller, Hasher, Signer>['destroy'];
    get generateCipherSharedKey(): Cipher['generateSharedKey'];
    get encrypt(): Cipher['encrypt'];
    get decrypt(): Cipher['decrypt'];
    get hash(): Hasher['hash'];
    get sign(): Signer['sign'];
    get seal(): Signer['seal'];
    get verify(): Signer['verify'];
    get open(): Signer['open'];
}

export { CamelCase as C, Nullable as N, Spark as S };
