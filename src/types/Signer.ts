import { ErrorInterface } from './Error';
// primitives
export type SigningPublicKey = string;
export type SigningSecretKey = string;
export type SigningKeyPair = { publicKey: SigningPublicKey, secretKey: SigningSecretKey };
export type SingingSeed = string;
export type Signature = string;
export type SignatureData = string | Record<string, any>;
export type SignatureVerified = boolean;

export enum Types {
  Ed25519 = 'Ed25519',
}

// abstract class used by classes that use Hasher
export abstract class SignerAbstract {
  public abstract getPublicKey(): SigningPublicKey | ErrorInterface;    // private _publicKey: PublicKey;
  public abstract getSecretKey(): SigningSecretKey | ErrorInterface;    // private _secretKey: SecretKey;
  public abstract getKeyPair(): SigningKeyPair | ErrorInterface;        // private _keyPair: KeyPair;

  public abstract initKeyPair(...any: any): Promise<void | ErrorInterface>;

  public abstract sign(...any: any): Promise<Signature | ErrorInterface>;
  public abstract verify(...any: any): Promise<SignatureVerified | ErrorInterface>;

  public abstract seal(data: SignatureData): Promise<Signature | ErrorInterface>;
  public abstract open(...any: any): Promise<SignatureData | ErrorInterface>;
}