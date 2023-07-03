import { Signature, SignatureData, SignatureVerified, SignerKeyPair, SignerPublicKey, SignerSecretKey } from "./types";
export declare abstract class CoreSigner {
    protected _publicKey: SignerPublicKey;
    protected _secretKey: SignerSecretKey;
    constructor();
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    getPublicKey(): SignerPublicKey;
    getSecretKey(): SignerSecretKey;
    getKeyPair(): SignerKeyPair;
    setKeyPair({ publicKey, secretKey }: SignerKeyPair): void;
    abstract generateKeyPair(params?: Record<string, any>): Promise<SignerKeyPair>;
    abstract sign(params?: Record<string, any>): Promise<Signature>;
    abstract verify(params?: Record<string, any>): Promise<SignatureVerified>;
    abstract seal(params?: Record<string, any>): Promise<Signature>;
    abstract open(params?: Record<string, any>): Promise<SignatureData>;
}
