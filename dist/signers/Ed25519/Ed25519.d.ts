import { SigatureDetached, Signature, SignatureData, SignatureVerified, SignerKeyPair, SignerPublicKey, SignerSecretKey } from "../types";
import { CoreSigner } from "../CoreSigner";
export declare class Ed25519 extends CoreSigner {
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
