import { SparkError, SparkErrorParams } from "./SparkError";

export enum SignerErrorType {
  GET_SIGNING_PUBLIC_KEY_ERROR = 'GET_SIGNING_PUBLIC_KEY_ERROR',
  GET_SIGNING_SECRET_KEY_ERROR = 'GET_SIGNING_SECRET_KEY_ERROR',
  GET_SIGNING_KEY_PAIR_ERROR = 'GET_SIGNING_KEY_PAIR_ERROR',
  SET_SIGNING_KEY_PAIR_ERROR = 'SET_SIGNING_KEY_PAIR_ERROR',
  GENERATE_SIGNING_KEY_PAIR_ERROR = 'GENERATE_SIGNING_KEY_PAIR_ERROR',
  MESSAGE_SIGNING_ERROR = 'MESSAGE_SIGNING_ERROR',
  SIGNATURE_VERIFICATION_ERROR = 'SIGNATURE_VERIFICATION_ERROR',
  MESSAGE_SEALING_ERROR = 'MESSAGE_SEALING_ERROR',
  SIGNATURE_OPENING_ERROR = 'SIGNATURE_OPENING_ERROR',
}

export class SignerErrors {
  public static GetSignerPublicKeyError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      type: SignerErrorType.GET_SIGNING_PUBLIC_KEY_ERROR,
      message: `failed to get signer public key`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static GetSignerSecretKeyError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      type: SignerErrorType.GET_SIGNING_SECRET_KEY_ERROR,
      message: `failed to get signer secret key`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static GetSignerKeyPairError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      type: SignerErrorType.GET_SIGNING_KEY_PAIR_ERROR,
      message: `failed to get signer key pair`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static SetSignerKeyPairError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      type: SignerErrorType.SET_SIGNING_KEY_PAIR_ERROR,
      message: `failed to set signer key pair`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static GenerateSignerKeyPairError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      type: SignerErrorType.GENERATE_SIGNING_KEY_PAIR_ERROR,
      message: `failed to generate signer key pair`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static MessageSigningError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      type: SignerErrorType.MESSAGE_SIGNING_ERROR,
      message: `failed to sign message`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static SignatureVerificationError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      type: SignerErrorType.SIGNATURE_VERIFICATION_ERROR,
      message: `failed to verify signature`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static MessageSealingError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      type: SignerErrorType.MESSAGE_SEALING_ERROR,
      message: `failed to seal message`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static SignatureOpeningError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      type: SignerErrorType.SIGNATURE_OPENING_ERROR,
      message: `failed to open signature`,
      metadata: { ...metadata },
      stack: stack
    });
  }
}
