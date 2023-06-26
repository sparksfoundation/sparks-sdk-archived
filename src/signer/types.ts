import { ErrorInterface } from '../common/errors';

// primitives
export type SigningPublicKey = string;
export type SigningSecretKey = string;
export type SigningKeyPair = { publicKey: SigningPublicKey, secretKey: SigningSecretKey };
export type SingingSeed = string;
export type Signature = string;
export type SignatureData = string | Record<string, any>;
export type SignatureVerified = boolean;

export enum SignerType {
  CORE_SIGNER = 'CORE_SIGNER',
  ED25519_SIGNER = 'ED25519_SIGNER',
}

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
