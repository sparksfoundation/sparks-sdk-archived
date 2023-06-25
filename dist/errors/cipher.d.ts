import { SparkError } from ".";
import { ErrorMessage } from "../types";
export declare enum CipherErrorType {
    INVALID_PUBLIC_ENCRYPTION_KEY = "INVALID_PUBLIC_ENCRYPTION_KEY",
    INVALID_SECRET_ENCRYPTION_KEY = "INVALID_SECRET_ENCRYPTION_KEY",
    INVALID_ENCRYPTION_KEYPAIR = "INVALID_ENCRYPTION_KEYPAIR",
    GENERATE_ENCRYPTION_KEYPAIR_ERROR = "GENERATE_ENCRYPTION_KEYPAIR_ERROR",
    GENERATE_SHARED_ENCRYPTION_KEY_ERROR = "GENERATE_SHARED_ENCRYPTION_KEY_ERROR",
    ENCRYPTION_FAILURE = "ENCRYPTION_FAILURE",
    DECRYPTION_FAILURE = "DECRYPTION_FAILURE"
}
export declare class CipherErrorFactory {
    private cipher;
    constructor(cipher: any);
    InvalidPublicKey(): SparkError;
    InvalidSecretKey(): SparkError;
    InvalidKeyPair(): SparkError;
    KeyPairFailure(reason?: ErrorMessage): SparkError;
    SharedKeyFailure(reason?: ErrorMessage): SparkError;
    EncryptionFailure(reason?: ErrorMessage): SparkError;
    DecryptionFailure(reason?: ErrorMessage): SparkError;
}
