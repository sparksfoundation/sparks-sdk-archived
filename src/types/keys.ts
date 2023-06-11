

export type SigningPublicKey = string;    // base64 signing keypair's public key
export type SigningSecretKey = string;    // base64 signing keypair's secret key
export type EncryptionPublicKey = string; // base64 encryption keypair's public key
export type EncryptionSecretKey = string; // base64 encryption keypair's secret key
export type EncryptionSharedKey = string; // base64 encryption shared key

export type SingingPublicKeyHash = string;    // base64 hash of signing public signing key
export type EncryptionPublicKeyHash = string; // base64 hash of encryption public signing key

export type EncryptionKeyPair = {
  publicKey: EncryptionPublicKey;         // base64 encryption public key
  secretKey: EncryptionSecretKey;         // base64 encryption secret key
}

export type SigningKeyPair = {
  publicKey: SigningPublicKey;            // base64 signing public key
  secretKey: EncryptionPublicKey;         // base64 signing secret key
}

export type PublicKeys = {
  encryption: EncryptionPublicKey;        // base64 encryption public key
  signing: SigningPublicKey;              // base64 signing public key
}

export type KeyPairs = {
  encryption: EncryptionKeyPair;          // base64 encryption public and secret keys
  signing: SigningKeyPair;                // base64 signing public and secret keys
}