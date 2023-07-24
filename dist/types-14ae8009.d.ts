type SignerPublicKey = string;
type SignerSecretKey = string;
type SignerKeyPair = {
    publicKey: SignerPublicKey;
    secretKey: SignerSecretKey;
};
type Signature = string;
type SignatureVerified = boolean;
type SignatureData = string | Record<string, any>;
type SigatureDetached = string;
interface SparkSignerInterface {
    readonly publicKey: SignerPublicKey;
    readonly secretKey: SignerSecretKey;
    readonly keyPair: SignerKeyPair;
    generateKeyPair(params?: Record<string, any>): Promise<SignerKeyPair>;
    setKeyPair(params: SignerKeyPair): void;
    sign(params?: Record<string, any>): Promise<Signature>;
    verify(params?: Record<string, any>): Promise<SignatureVerified>;
    seal(params?: Record<string, any>): Promise<Signature>;
    open(params?: Record<string, any>): Promise<SignatureData>;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
}

export { SignerKeyPair as S, SigatureDetached as a, SignatureVerified as b, Signature as c, SignatureData as d, SignerPublicKey as e, SparkSignerInterface as f, SignerSecretKey as g };
