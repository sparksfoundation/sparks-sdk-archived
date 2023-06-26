import { ErrorInterface } from '../common/errors';

// primitives
export type SigningPublicKey = string;
export type SigningSecretKey = string;
export type SigningKeyPair = { publicKey: SigningPublicKey, secretKey: SigningSecretKey };
export type SingingSeed = string;
export type Signature = string;
export type SignatureData = string | Record<string, any>;
export type SignatureVerified = boolean;

export enum SignerTypes {
  Ed25519 = 'Ed25519',
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

// abstract class used by classes that use Hasher
export abstract class SignerAbstract {
  public abstract getPublicKey(): SigningPublicKey | ErrorInterface;    // private _publicKey: PublicKey;
  public abstract getSecretKey(): SigningSecretKey | ErrorInterface;    // private _secretKey: SecretKey;
  public abstract getKeyPair(): SigningKeyPair | ErrorInterface;        // private _keyPair: KeyPair;

  public abstract initKeyPair(...any: any): Promise<void | ErrorInterface>;
  public abstract getNextKeyPair(...any: any): Promise<SigningKeyPair | ErrorInterface>;

  public abstract sign(...any: any): Promise<Signature | ErrorInterface>;
  public abstract verify(...any: any): Promise<SignatureVerified | ErrorInterface>;

  public abstract seal(data: SignatureData): Promise<Signature | ErrorInterface>;
  public abstract open(...any: any): Promise<SignatureData | ErrorInterface>;
}