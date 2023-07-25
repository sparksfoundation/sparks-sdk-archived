import { C as CipherKeyPair, a as CipherPublicKey, b as CipherSecretKey, D as DecryptedData, E as EncryptedData } from '../../types-188a9fde.js';
import { S as SparkCipher, X as X25519SalsaPoly } from '../../index-df13929e.js';

type CipherKeyPairWithSalt = CipherKeyPair & {
    salt: string;
};
declare class X25519SalsaPolyPassword extends SparkCipher {
    private _X25519SalsaPoly;
    private _salt;
    constructor();
    get salt(): string;
    get publicKey(): CipherPublicKey;
    get secretKey(): CipherSecretKey;
    get keyPair(): CipherKeyPairWithSalt;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    generateSharedKey(params: Parameters<X25519SalsaPoly['generateSharedKey']>[0]): Promise<string>;
    generateKeyPair({ password, salt: nonce }: {
        password: string;
        salt?: string;
    }): Promise<CipherKeyPairWithSalt>;
    setKeyPair({ publicKey, secretKey, salt }: CipherKeyPairWithSalt): void;
    decrypt(params: Parameters<X25519SalsaPoly['decrypt']>[0]): Promise<DecryptedData>;
    encrypt(params: Parameters<X25519SalsaPoly['encrypt']>[0]): Promise<EncryptedData>;
}

export { CipherKeyPairWithSalt, X25519SalsaPolyPassword };
