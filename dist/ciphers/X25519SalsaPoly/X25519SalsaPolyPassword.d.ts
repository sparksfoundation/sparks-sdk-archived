import { CoreCipher } from "../CoreCipher";
import { DecryptedData, EncryptedData, CipherKeyPair, CipherPublicKey, CipherSecretKey } from "../types";
import { X25519SalsaPoly } from "./X25519SalsaPoly";
export type CipherKeyPairWithSalt = CipherKeyPair & {
    salt: string;
};
export declare class X25519SalsaPolyPassword extends CoreCipher {
    private X25519SalsaPoly;
    private _salt;
    constructor();
    get salt(): string;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    generateKeyPair({ password, salt: nonce }: {
        password: string;
        salt?: string;
    }): Promise<CipherKeyPairWithSalt>;
    getPublicKey(): CipherPublicKey;
    getSecretKey(): CipherSecretKey;
    getKeyPair(): CipherKeyPairWithSalt;
    setKeyPair({ publicKey, secretKey, salt }: CipherKeyPairWithSalt): void;
    decrypt(params: Parameters<X25519SalsaPoly['decrypt']>[0]): Promise<DecryptedData>;
    encrypt(params: Parameters<X25519SalsaPoly['encrypt']>[0]): Promise<EncryptedData>;
    generateSharedKey(params: Parameters<X25519SalsaPoly['generateSharedKey']>[0]): Promise<string>;
}
