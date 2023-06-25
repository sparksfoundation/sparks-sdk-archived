import { Signature, SignatureData, SignerAbstract, SigningPublicKey, SingingSeed } from "../../types";
export declare class Ed25519 extends SignerAbstract {
    private _publicKey;
    private _secretKey;
    getPublicKey(): ReturnType<SignerAbstract['getPublicKey']>;
    getSecretKey(): ReturnType<SignerAbstract['getSecretKey']>;
    getKeyPair(): ReturnType<SignerAbstract['getKeyPair']>;
    initKeyPair(seed?: SingingSeed): ReturnType<SignerAbstract['initKeyPair']>;
    seal(data: SignatureData): ReturnType<SignerAbstract['seal']>;
    open({ publicKey, signature }: {
        publicKey: SigningPublicKey;
        signature: Signature;
    }): ReturnType<SignerAbstract['open']>;
    sign(data: SignatureData): ReturnType<SignerAbstract['sign']>;
    verify({ publicKey, signature, data }: {
        publicKey: SigningPublicKey;
        signature: Signature;
        data: SignatureData;
    }): ReturnType<SignerAbstract['verify']>;
}
