import { SparkError, SparkErrorParams } from "./SparkError";
export declare enum CipherErrorType {
    GET_ENCRYPTION_PUBLIC_KEY_ERROR = "GET_ENCRYPTION_PUBLIC_KEY_ERROR",
    GET_ENCRYPTION_SECRET_KEY_ERROR = "GET_ENCRYPTION_SECRET_KEY_ERROR",
    GET_ENCRYPTION_KEYPAIR_ERROR = "GET_ENCRYPTION_KEYPAIR_ERROR",
    SET_ENCRYPTION_KEYPAIR_ERROR = "SET_ENCRYPTION_KEYPAIR_ERROR",
    GENERATE_ENCRYPTION_KEY_PAIR_ERROR = "GENERATE_ENCRYPTION_KEY_PAIR_ERROR",
    GENERATE_ENCRYPTION_SHARED_KEY_ERROR = "GENERATE_ENCRYPTION_SHARED_KEY_ERROR",
    ENCRYPT_ERROR = "ENCRYPT_ERROR",
    DECRYPT_ERROR = "DECRYPT_ERROR"
}
export declare class CipherErrors {
    static GetCipherPublicKeyError({ metadata, stack }?: SparkErrorParams): SparkError;
    static GetCipherSecretKeyError({ metadata, stack }?: SparkErrorParams): SparkError;
    static GetEncryptionKeypairError({ metadata, stack }?: SparkErrorParams): SparkError;
    static SetEncryptionKeypairError({ metadata, stack }?: SparkErrorParams): SparkError;
    static GenerateCipherKeyPairError({ metadata, stack }?: SparkErrorParams): SparkError;
    static GenerateEncryptionSharedKeyError({ metadata, stack }?: SparkErrorParams): SparkError;
    static EncryptError({ metadata, stack }?: SparkErrorParams): SparkError;
    static DecryptError({ metadata, stack }?: SparkErrorParams): SparkError;
}
