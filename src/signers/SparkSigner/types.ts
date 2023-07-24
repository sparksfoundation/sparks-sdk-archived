export type SignerPublicKey = string;
export type SignerSecretKey = string;
export type SignerKeyPair = { publicKey: SignerPublicKey, secretKey: SignerSecretKey };

export type Signature = string;
export type SignatureVerified = boolean;
export type SignatureData = string | Record<string, any>;
export type SigatureDetached = string;

export interface SparkSignerInterface {
  readonly publicKey: SignerPublicKey;
  readonly secretKey: SignerSecretKey;
  readonly keyPair: SignerKeyPair;

  generateKeyPair(params?: Record<string, any>): Promise<SignerKeyPair>;
  setKeyPair(params: SignerKeyPair): void;

  sign(params?: Record<string, any>): Promise<Signature>;
  verify(params?: Record<string, any>): Promise<SignatureVerified>;

  seal(params?: Record<string, any>): Promise<Signature>;
  open(params?: Record<string, any>): Promise<SignatureData>;

  import(data: Record<string, any>): Promise<void>;
  export(): Promise<Record<string, any>>;
}

