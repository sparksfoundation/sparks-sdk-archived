// primitives
export type SigningPublicKey = string;
export type SigningSecretKey = string;
export type SigningKeyPair = { publicKey: SigningPublicKey, secretKey: SigningSecretKey };
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


