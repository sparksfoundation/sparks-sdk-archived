import { ErrorInterface } from './Error';
export type SigningPublicKey = string;
export type SigningSecretKey = string;
export type SigningKeyPair = {
    publicKey: SigningPublicKey;
    secretKey: SigningSecretKey;
};
export type SingingSeed = string;
export type Signature = string;
export type SignatureData = string | Record<string, any>;
export type SignatureVerified = boolean;
export declare enum Types {
    Ed25519 = "Ed25519"
}
export declare abstract class SignerAbstract {
    abstract getPublicKey(): SigningPublicKey | ErrorInterface;
    abstract getSecretKey(): SigningSecretKey | ErrorInterface;
    abstract getKeyPair(): SigningKeyPair | ErrorInterface;
    abstract initKeyPair(...any: any): Promise<void | ErrorInterface>;
    abstract sign(...any: any): Promise<Signature | ErrorInterface>;
    abstract verify(...any: any): Promise<SignatureVerified | ErrorInterface>;
    abstract seal(data: SignatureData): Promise<Signature | ErrorInterface>;
    abstract open(...any: any): Promise<SignatureData | ErrorInterface>;
}
