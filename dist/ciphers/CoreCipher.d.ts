import { DecryptedData, EncryptedData, CipherKeyPair, CipherPublicKey, CipherSecretKey, EncryptionSharedKey } from "./types";
export declare abstract class CoreCipher {
    protected _publicKey: CipherPublicKey;
    protected _secretKey: CipherSecretKey;
    constructor();
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    getPublicKey(): CipherPublicKey;
    getSecretKey(): CipherSecretKey;
    getKeyPair(): CipherKeyPair;
    setKeyPair({ publicKey, secretKey }: CipherKeyPair): void;
    abstract generateKeyPair(params?: Record<string, any>): Promise<CipherKeyPair>;
    abstract generateSharedKey(params?: Record<string, any>): Promise<EncryptionSharedKey>;
    abstract encrypt(params?: Record<string, any>): Promise<EncryptedData>;
    abstract decrypt(params?: Record<string, any>): Promise<DecryptedData>;
}
