import { SparkError, SparkErrorParams } from "./SparkError";

export enum SignerErrorName {
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
  public static GetSigningPublicKeyError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.GET_SIGNING_PUBLIC_KEY_ERROR,
      message: `failed to get signing public key`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static GetSigningSecretKeyError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.GET_SIGNING_SECRET_KEY_ERROR,
      message: `failed to get signing secret key`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static GetSigningKeyPairError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.GET_SIGNING_KEY_PAIR_ERROR,
      message: `failed to get signing key pair`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static SetSigningKeyPairError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.SET_SIGNING_KEY_PAIR_ERROR,
      message: `failed to set signing key pair`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static GenerateSigningKeyPairError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.GENERATE_SIGNING_KEY_PAIR_ERROR,
      message: `failed to generate signing key pair`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static MessageSigningError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.MESSAGE_SIGNING_ERROR,
      message: `failed to sign message`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static SignatureVerificationError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.SIGNATURE_VERIFICATION_ERROR,
      message: `failed to verify signature`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static MessageSealingError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.MESSAGE_SEALING_ERROR,
      message: `failed to seal message`,
      metadata: { ...metadata },
      stack: stack
    });
  }

  public static SignatureOpeningError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.SIGNATURE_OPENING_ERROR,
      message: `failed to open signature`,
      metadata: { ...metadata },
      stack: stack
    });
  }
}
