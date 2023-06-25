import { SparkError } from ".";
import { ErrorMessage } from "../types";

export enum SignerErrorType {
    // signer errors
    INVALID_PUBLIC_SIGNING_KEY = 'INVALID_PUBLIC_SIGNING_KEY',
    INVALID_SECRET_SIGNING_KEY = 'INVALID_SECRET_SIGNING_KEY',
    INVALID_SIGNING_KEY_PAIR = 'INVALID_SIGNING_KEY_PAIR',
    GENERATE_SIGNING_KEYPAIR_ERROR = 'GENERATE_SIGNING_KEYPAIR_ERROR',
    SIGNING_FAILURE = 'SIGNING_FAILURE',
    SIGNATURE_OPEN_FAILURE = 'SIGNATURE_OPEN_FAILURE',
    SEAL_DATA_FAILURE = 'SEAL_DATA_FAILURE',
    SIGNATURE_VERIFICATION_FAILURE = 'SIGNATURE_VERIFICATION_FAILURE',
}

export class SignerErrorFactory {
    private signer: string;
    constructor(signer) {
        this.signer = signer;
    }

    // no additional reasons for getters
    public InvalidPublicKey() {
        return new SparkError({
            type: SignerErrorType.INVALID_PUBLIC_SIGNING_KEY,
            message: 'invalid public signing key',
            metadata: { signer: this.signer }
        });
    }

    public InvalidSecretKey() {
        return new SparkError({
            type: SignerErrorType.INVALID_SECRET_SIGNING_KEY,
            message: 'invalid secret signing key',
            metadata: { signer: this.signer }
        });
    }

    public InvalidKeyPair() {
        return new SparkError({
            type: SignerErrorType.INVALID_SIGNING_KEY_PAIR,
            message: `invalid signing key pair`,
            metadata: { signer: this.signer }
        });
    }

    public KeyPairFailure(reason?: ErrorMessage) {
        return new SparkError({
            type: SignerErrorType.GENERATE_SIGNING_KEYPAIR_ERROR,
            message: `failed to generate signing key pair${reason ? `: ${reason}` : ''}`,
            metadata: { signer: this.signer }
        });
    }

    public SigningFailure(reason?: ErrorMessage) {
        return new SparkError({
            type: SignerErrorType.SIGNING_FAILURE,
            message: `failed to sign data${reason ? `: ${reason}` : ''}`,
            metadata: { signer: this.signer }
        });
    }

    public SignatureOpenFailure(reason?: ErrorMessage) {
        return new SparkError({
            type: SignerErrorType.SIGNATURE_OPEN_FAILURE,
            message: `failed to open signature${reason ? `: ${reason}` : ''}`,
            metadata: { signer: this.signer }
        });
    }

    public SealDataFailure(reason?: ErrorMessage) {
        return new SparkError({
            type: SignerErrorType.SEAL_DATA_FAILURE,
            message: `failed to seal data${reason ? `: ${reason}` : ''}`,
            metadata: { signer: this.signer }
        });
    }

    public SignatureVerificationFailure(reason?: ErrorMessage) {
        return new SparkError({
            type: SignerErrorType.SIGNATURE_VERIFICATION_FAILURE,
            message: `failed to verify signature${reason ? `: ${reason}` : ''}`,
            metadata: { signer: this.signer }
        });
    }
}


