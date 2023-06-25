import { CipherAbstract, DecryptedData, EncryptedData, EncryptionPublicKey, EncryptionSecret, EncryptionSharedKey } from "../../types";
export declare class X25519SalsaPoly extends CipherAbstract {
    private _publicKey;
    private _secretKey;
    getPublicKey(): ReturnType<CipherAbstract['getPublicKey']>;
    getSecretKey(): ReturnType<CipherAbstract['getSecretKey']>;
    getKeyPair(): ReturnType<CipherAbstract['getKeyPair']>;
    initKeyPair(secret?: EncryptionSecret): ReturnType<CipherAbstract['initKeyPair']>;
    computeSharedKey(publicKey: EncryptionPublicKey): ReturnType<CipherAbstract['computeSharedKey']>;
    encrypt({ data, publicKey, sharedKey }: {
        data: DecryptedData;
        publicKey?: EncryptionPublicKey;
        sharedKey?: EncryptionSharedKey;
    }): ReturnType<CipherAbstract['encrypt']>;
    decrypt({ data, publicKey, sharedKey }: {
        data: EncryptedData;
        publicKey?: EncryptionPublicKey;
        sharedKey?: EncryptionSharedKey;
    }): ReturnType<CipherAbstract['decrypt']>;
}
