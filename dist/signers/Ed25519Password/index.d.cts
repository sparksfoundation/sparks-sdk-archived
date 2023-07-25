import { S as SignerKeyPair, a as SigatureDetached, b as SignatureVerified, c as Signature, d as SignatureData } from '../../types-93f6b970.js';
import { S as SparkSigner, E as Ed25519 } from '../../index-70eef99e.js';

type SignerKeyPairWithSalt = SignerKeyPair & {
    salt: string;
};
declare class Ed25519Password extends SparkSigner {
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
    get publicKey(): SignerKeyPair['publicKey'];
    get secretKey(): SignerKeyPair['secretKey'];
    get keyPair(): SignerKeyPairWithSalt;
    setKeyPair({ publicKey, secretKey, salt }: SignerKeyPairWithSalt): void;
    sign(args: Parameters<Ed25519['sign']>[0]): Promise<SigatureDetached>;
    verify(args: Parameters<Ed25519['verify']>[0]): Promise<SignatureVerified>;
    seal(args: Parameters<Ed25519['seal']>[0]): Promise<Signature>;
    open(args: Parameters<Ed25519['open']>[0]): Promise<SignatureData>;
}

export { Ed25519Password, SignerKeyPairWithSalt };
