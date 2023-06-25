import { AgentTypes, CipherTypes, ControllerTypes, ErrorTypes, HasherTypes, SignerTypes, SparkTypes } from "./types";
import { Constructable } from "./types/utilities";
export declare class Spark<A extends AgentTypes.AgentAbstract[], C extends CipherTypes.CipherAbstract, H extends HasherTypes.HasherAbstract, S extends SignerTypes.SignerAbstract> implements SparkTypes.SparkInterface<A, C, H, S> {
    private cipher;
    private hasher;
    private signer;
    agents: {
        [key: string]: InstanceType<Constructable<A[number]>>;
    };
    private controller;
    constructor({ agents, cipher, hasher, signer }: SparkTypes.SparkParams<A, C, H, S>);
    get identifier(): ControllerTypes.Identifier | ErrorTypes.ErrorInterface;
    get keyEventLog(): ControllerTypes.KeyEventLog | ErrorTypes.ErrorInterface;
    get keyPairs(): SparkTypes.KeyPairs | ErrorTypes.ErrorInterface;
    get publicKeys(): SparkTypes.PublicKeys | ErrorTypes.ErrorInterface;
    get secretKeys(): SparkTypes.SecretKeys | ErrorTypes.ErrorInterface;
    get encryptionKeys(): C['getKeyPair'];
    get signingKeys(): S['getKeyPair'];
    get initEncryptionKeys(): C['initKeyPair'];
    get computSharedEncryptionKey(): C['computeSharedKey'];
    get encrypt(): C['encrypt'];
    get decrypt(): C['decrypt'];
    get hash(): H['hash'];
    get initSingingKeys(): S['initKeyPair'];
    get sign(): S['sign'];
    get seal(): S['seal'];
    get verify(): S['verify'];
    get open(): S['open'];
    get incept(): ControllerTypes.ControllerInterface['incept'];
    get rotate(): ControllerTypes.ControllerInterface['rotate'];
    get destroy(): ControllerTypes.ControllerInterface['destroy'];
    import(data: CipherTypes.CipherText): Promise<void | ErrorTypes.ErrorInterface>;
    export(): Promise<HasherTypes.Hash>;
}
