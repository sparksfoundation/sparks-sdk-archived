import { SparkError } from ".";
import { ErrorMessage } from "../types";
export declare enum SignerErrorType {
    INVALID_PUBLIC_SIGNING_KEY = "INVALID_PUBLIC_SIGNING_KEY",
    INVALID_SECRET_SIGNING_KEY = "INVALID_SECRET_SIGNING_KEY",
    INVALID_SIGNING_KEY_PAIR = "INVALID_SIGNING_KEY_PAIR",
    GENERATE_SIGNING_KEYPAIR_ERROR = "GENERATE_SIGNING_KEYPAIR_ERROR",
    SIGNING_FAILURE = "SIGNING_FAILURE",
    SIGNATURE_OPEN_FAILURE = "SIGNATURE_OPEN_FAILURE",
    SEAL_DATA_FAILURE = "SEAL_DATA_FAILURE",
    SIGNATURE_VERIFICATION_FAILURE = "SIGNATURE_VERIFICATION_FAILURE"
}
export declare class SignerErrorFactory {
    private signer;
    constructor(signer: any);
    InvalidPublicKey(): SparkError;
    InvalidSecretKey(): SparkError;
    InvalidKeyPair(): SparkError;
    KeyPairFailure(reason?: ErrorMessage): SparkError;
    SigningFailure(reason?: ErrorMessage): SparkError;
    SignatureOpenFailure(reason?: ErrorMessage): SparkError;
    SealDataFailure(reason?: ErrorMessage): SparkError;
    SignatureVerificationFailure(reason?: ErrorMessage): SparkError;
}
