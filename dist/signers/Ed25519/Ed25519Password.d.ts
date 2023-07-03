import { SigatureDetached, Signature, SignatureData, SignatureVerified, SignerKeyPair } from "../types";
import { Ed25519 } from "./Ed25519";
import { CoreSigner } from '../CoreSigner';
export type SignerKeyPairWithSalt = SignerKeyPair & {
    salt: string;
};
export declare class Ed25519Password extends CoreSigner {
    private Ed25519;
    private _salt;
    constructor();
    get salt(): string;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    generateKeyPair({ password, salt: nonce }: {
        password: string;
        salt?: string;
    }): Promise<SignerKeyPairWithSalt>;
    getPublicKey(): SignerKeyPair['publicKey'];
    getSecretKey(): SignerKeyPair['secretKey'];
    getKeyPair(): SignerKeyPairWithSalt;
    setKeyPair({ publicKey, secretKey, salt }: SignerKeyPairWithSalt): void;
    sign(args: Parameters<Ed25519['sign']>[0]): Promise<SigatureDetached>;
    verify(args: Parameters<Ed25519['verify']>[0]): Promise<SignatureVerified>;
    seal(args: Parameters<Ed25519['seal']>[0]): Promise<Signature>;
    open(args: Parameters<Ed25519['open']>[0]): Promise<SignatureData>;
}
