import { SparkError, SparkErrorParams } from "./SparkError";
export declare enum SignerErrorName {
    GET_SIGNING_PUBLIC_KEY_ERROR = "GET_SIGNING_PUBLIC_KEY_ERROR",
    GET_SIGNING_SECRET_KEY_ERROR = "GET_SIGNING_SECRET_KEY_ERROR",
    GET_SIGNING_KEY_PAIR_ERROR = "GET_SIGNING_KEY_PAIR_ERROR",
    SET_SIGNING_KEY_PAIR_ERROR = "SET_SIGNING_KEY_PAIR_ERROR",
    GENERATE_SIGNING_KEY_PAIR_ERROR = "GENERATE_SIGNING_KEY_PAIR_ERROR",
    MESSAGE_SIGNING_ERROR = "MESSAGE_SIGNING_ERROR",
    SIGNATURE_VERIFICATION_ERROR = "SIGNATURE_VERIFICATION_ERROR",
    MESSAGE_SEALING_ERROR = "MESSAGE_SEALING_ERROR",
    SIGNATURE_OPENING_ERROR = "SIGNATURE_OPENING_ERROR"
}
export declare class SignerErrors {
    static GetSignerPublicKeyError({ metadata, stack }?: SparkErrorParams): SparkError;
    static GetSignerSecretKeyError({ metadata, stack }?: SparkErrorParams): SparkError;
    static GetSignerKeyPairError({ metadata, stack }?: SparkErrorParams): SparkError;
    static SetSignerKeyPairError({ metadata, stack }?: SparkErrorParams): SparkError;
    static GenerateSignerKeyPairError({ metadata, stack }?: SparkErrorParams): SparkError;
    static MessageSigningError({ metadata, stack }?: SparkErrorParams): SparkError;
    static SignatureVerificationError({ metadata, stack }?: SparkErrorParams): SparkError;
    static MessageSealingError({ metadata, stack }?: SparkErrorParams): SparkError;
    static SignatureOpeningError({ metadata, stack }?: SparkErrorParams): SparkError;
}
