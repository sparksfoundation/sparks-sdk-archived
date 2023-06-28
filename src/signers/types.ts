// primitives
export type SignerPublicKey = string;
export type SignerSecretKey = string;
export type SignerKeyPair = { publicKey: SignerPublicKey, secretKey: SignerSecretKey };
export type SignatureData = string | Record<string, any>;
export type SignatureVerified = boolean;
export type SigatureDetached = string;
export type Signature = string;
export type SignedData = string;
export type SignedEncryptedData = string;

export enum SignerType {
  SIGNER_CORE = 'SIGNER_CORE',
  ED25519_SIGNER = 'ED25519_SIGNER',
}
