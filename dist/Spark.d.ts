import { SparkInterface } from "./types";
import { CoreAgent } from "./agents/CoreAgent";
import { CoreCipher } from "./ciphers/CoreCipher";
import { CoreHasher } from "./hashers/CoreHasher";
import { CoreSigner } from "./signers/CoreSigner";
import { CoreController } from "./controllers";
import { Constructable } from "./utilities/types";
import { SignedEncryptedData } from "./signers/types";
export declare class Spark<A extends CoreAgent[], X extends CoreCipher, C extends CoreController, H extends CoreHasher, S extends CoreSigner> implements SparkInterface<A, X, C, H, S> {
    readonly cipher: X;
    readonly controller: C;
    readonly hasher: H;
    readonly signer: S;
    readonly agents: {
        [key: string]: InstanceType<Constructable<A[number]>>;
    };
    constructor({ agents, cipher, controller, hasher, signer, }: {
        agents?: Array<new (spark: Spark<A, X, C, H, S>) => A[number]>;
        cipher: Constructable<X>;
        controller: Constructable<C>;
        hasher: Constructable<H>;
        signer: Constructable<S>;
    });
    private _generateKeyPairs;
    private _setKeyPairs;
    get keyPairs(): {
        signer: ReturnType<S['getKeyPair']>;
        cipher: ReturnType<X['getKeyPair']>;
    };
    get secretKeys(): {
        cipher: ReturnType<X['getSecretKey']>;
        signer: ReturnType<S['getSecretKey']>;
    };
    get publicKeys(): SparkInterface<A, X, C, H, S>['publicKeys'];
    import: {
        (params: Parameters<X['generateKeyPair']>[0] & Parameters<S['generateKeyPair']>[0] & {
            data: SignedEncryptedData;
        }): Promise<void>;
        (params: {
            cipher: Parameters<X['generateKeyPair']>[0];
            signer: Parameters<S['generateKeyPair']>[0];
            data: SignedEncryptedData;
        }): Promise<void>;
    };
    export: SparkInterface<A, X, C, H, S>['export'];
    get identifier(): ReturnType<C['getIdentifier']>;
    get keyEventLog(): ReturnType<C['getKeyEventLog']>;
    incept: {
        (params: Parameters<X['generateKeyPair']>[0] & Parameters<S['generateKeyPair']>[0]): Promise<void>;
        (params: {
            cipher: Parameters<X['generateKeyPair']>[0];
            signer: Parameters<S['generateKeyPair']>[0];
        }): Promise<void>;
        (): Promise<void>;
    };
    rotate: {
        (params: Parameters<X['generateKeyPair']>[0] & Parameters<S['generateKeyPair']>[0]): Promise<void>;
        (params: {
            cipher: Parameters<X['generateKeyPair']>[0];
            signer: Parameters<S['generateKeyPair']>[0];
        }): Promise<void>;
    };
    destroy: SparkInterface<A, X, C, H, S>['destroy'];
    get generateCipherSharedKey(): X['generateSharedKey'];
    get encrypt(): X['encrypt'];
    get decrypt(): X['decrypt'];
    get hash(): H['hash'];
    get sign(): S['sign'];
    get seal(): S['seal'];
    get verify(): S['verify'];
    get open(): S['open'];
}
