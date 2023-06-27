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
  public static GetSigningPublicKeyError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.GET_SIGNING_PUBLIC_KEY_ERROR,
      message: `failed to get signing public key${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GetSigningSecretKeyError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.GET_SIGNING_SECRET_KEY_ERROR,
      message: `failed to get signing secret key${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GetSigningKeyPairError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.GET_SIGNING_KEY_PAIR_ERROR,
      message: `failed to get signing key pair${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static SetSigningKeyPairError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.SET_SIGNING_KEY_PAIR_ERROR,
      message: `failed to set signing key pair${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GenerateSigningKeyPairError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.GENERATE_SIGNING_KEY_PAIR_ERROR,
      message: `failed to generate signing key pair${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static MessageSigningError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.MESSAGE_SIGNING_ERROR,
      message: `failed to sign message${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static SignatureVerificationError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.SIGNATURE_VERIFICATION_ERROR,
      message: `failed to verify signature${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static MessageSealingError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.MESSAGE_SEALING_ERROR,
      message: `failed to seal message${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static SignatureOpeningError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: SignerErrorName.SIGNATURE_OPENING_ERROR,
      message: `failed to open signature${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }
}
