import { ErrorInterface } from "./Error";
export type EncryptionSharedKey = string;
export type EncryptionPublicKey = string;
export type EncryptionSecretKey = string;
export type EncryptionKeyPair = {
    publicKey: EncryptionPublicKey;
    secretKey: EncryptionSecretKey;
};
export type DecryptedData = string | Record<string, any>;
export type EncryptedData = string;
export type EncryptionSecret = string;
export declare abstract class CipherAbstract {
    abstract getPublicKey(): EncryptionPublicKey | ErrorInterface;
    abstract getSecretKey(): EncryptionSecretKey | ErrorInterface;
    abstract getKeyPair(): EncryptionKeyPair | ErrorInterface;
    abstract initKeyPair(...args: any): Promise<EncryptionKeyPair | ErrorInterface>;
    abstract computeSharedKey(...args: any): Promise<EncryptionSharedKey | ErrorInterface>;
    abstract encrypt(...args: any): Promise<EncryptedData | ErrorInterface>;
    abstract decrypt(...args: any): Promise<DecryptedData | ErrorInterface>;
}
