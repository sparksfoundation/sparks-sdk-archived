import { S as SparkCipherInterface, a as CipherPublicKey, b as CipherSecretKey, C as CipherKeyPair, c as EncryptionSharedKey, E as EncryptedData, D as DecryptedData, d as EncryptionSecret } from './types-188a9fde.js';

declare abstract class SparkCipher implements SparkCipherInterface {
    private _publicKey;
    private _secretKey;
    constructor();
    get publicKey(): CipherPublicKey;
    get secretKey(): CipherSecretKey;
    get keyPair(): CipherKeyPair;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    setKeyPair({ publicKey, secretKey }: CipherKeyPair): void;
    abstract generateKeyPair(params?: Record<string, any>): Promise<CipherKeyPair>;
    abstract generateSharedKey(params?: Record<string, any>): Promise<EncryptionSharedKey>;
    abstract encrypt(params?: Record<string, any>): Promise<EncryptedData>;
    abstract decrypt(params?: Record<string, any>): Promise<DecryptedData>;
}

declare class X25519SalsaPoly extends SparkCipher {
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    generateKeyPair(params?: {
        secretKey?: EncryptionSecret;
    }): ReturnType<SparkCipher['generateKeyPair']>;
    generateSharedKey({ publicKey }: {
        publicKey: CipherPublicKey;
    }): ReturnType<SparkCipher['generateSharedKey']>;
    encrypt({ data, publicKey, sharedKey }: {
        data: DecryptedData;
        publicKey?: CipherPublicKey;
        sharedKey?: EncryptionSharedKey;
    }): ReturnType<SparkCipher['encrypt']>;
    decrypt({ data, publicKey, sharedKey }: {
        data: EncryptedData;
        publicKey?: CipherPublicKey;
        sharedKey?: EncryptionSharedKey;
    }): ReturnType<SparkCipher['decrypt']>;
}

export { SparkCipher as S, X25519SalsaPoly as X };
