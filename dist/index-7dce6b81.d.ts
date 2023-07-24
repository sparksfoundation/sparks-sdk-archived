import { f as SparkSignerInterface, e as SignerPublicKey, g as SignerSecretKey, S as SignerKeyPair, c as Signature, b as SignatureVerified, d as SignatureData, a as SigatureDetached } from './types-14ae8009.js';

declare abstract class SparkSigner implements SparkSignerInterface {
    protected _publicKey: SignerPublicKey;
    protected _secretKey: SignerSecretKey;
    constructor();
    get publicKey(): SignerPublicKey;
    get secretKey(): SignerSecretKey;
    get keyPair(): SignerKeyPair;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    setKeyPair({ publicKey, secretKey }: SignerKeyPair): void;
    abstract generateKeyPair(params?: Record<string, any>): Promise<SignerKeyPair>;
    abstract sign(params?: Record<string, any>): Promise<Signature>;
    abstract verify(params?: Record<string, any>): Promise<SignatureVerified>;
    abstract seal(params?: Record<string, any>): Promise<Signature>;
    abstract open(params?: Record<string, any>): Promise<SignatureData>;
}

declare class Ed25519 extends SparkSigner {
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    generateKeyPair(params?: {
        secretKey?: SignerSecretKey;
    }): Promise<SignerKeyPair>;
    seal({ data }: {
        data: SignatureData;
    }): Promise<Signature>;
    open({ publicKey, signature }: {
        publicKey: SignerPublicKey;
        signature: Signature;
    }): Promise<SignatureData>;
    sign({ data }: {
        data: SignatureData;
    }): Promise<SigatureDetached>;
    verify({ publicKey, signature, data }: {
        publicKey: SignerPublicKey;
        signature: Signature;
        data: SignatureData;
    }): Promise<SignatureVerified>;
}

export { Ed25519 as E, SparkSigner as S };
