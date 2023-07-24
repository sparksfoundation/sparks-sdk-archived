type EncryptionSharedKey = string;
type CipherPublicKey = string;
type CipherSecretKey = string;
type CipherKeyPair = {
    publicKey: CipherPublicKey;
    secretKey: CipherSecretKey;
};
type DecryptedData = string | Record<string, any>;
type EncryptedData = string;
type EncryptionSecret = string;
interface SparkCipherInterface {
    readonly publicKey: string;
    readonly secretKey: string;
    readonly keyPair: {
        publicKey: string;
        secretKey: string;
    };
    generateSharedKey(params?: Record<string, any>): Promise<EncryptionSharedKey>;
    generateKeyPair(params?: Record<string, any>): Promise<CipherKeyPair>;
    setKeyPair(params: CipherKeyPair): void;
    encrypt(params?: Record<string, any>): Promise<EncryptedData>;
    decrypt(params?: Record<string, any>): Promise<DecryptedData>;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
}

export { CipherKeyPair as C, DecryptedData as D, EncryptedData as E, SparkCipherInterface as S, CipherPublicKey as a, CipherSecretKey as b, EncryptionSharedKey as c, EncryptionSecret as d };
