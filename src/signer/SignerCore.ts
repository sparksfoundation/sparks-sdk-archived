import { SignerErrors } from "../error/signer";
import { Signature, SignatureData, SignatureVerified, SigningKeyPair, SigningPublicKey, SigningSecretKey } from "./types";

// abstract class used by classes that use Hasher
export abstract class SignerCore {
  protected _publicKey: SigningPublicKey;
  protected _secretKey: SigningSecretKey;

  constructor() {
    this.getPublicKey = this.getPublicKey.bind(this);
    this.getSecretKey = this.getSecretKey.bind(this);
    this.getKeyPair = this.getKeyPair.bind(this);
    this.setKeyPair = this.setKeyPair.bind(this);
    this.generateKeyPair = this.generateKeyPair.bind(this);
    this.sign = this.sign.bind(this);
    this.verify = this.verify.bind(this);
    this.seal = this.seal.bind(this);
    this.open = this.open.bind(this);
  }

  public getPublicKey(): SigningPublicKey {
    try {
      if (!this._publicKey) throw new Error('No public key found.');
      return this._publicKey as SigningPublicKey;
    } catch (error) {
      throw SignerErrors.GetSigningPublicKeyError(error);
    }
  }

  public getSecretKey(): SigningSecretKey {
    try {
      if (!this._secretKey) throw new Error('No secret key found.');
      return this._secretKey as SigningSecretKey;
    } catch (error) {
      throw SignerErrors.GetSigningSecretKeyError(error);
    }
  }

  public getKeyPair(): SigningKeyPair {
    try {
      const publicKey = this.getPublicKey() as SigningPublicKey;
      if (!publicKey) throw new Error('No public key found.');
  
      const secretKey = this.getSecretKey() as SigningSecretKey;
      if (!secretKey) throw new Error('No secret key found.');
  
      return { publicKey, secretKey } as SigningKeyPair;
    } catch(error) {
      throw SignerErrors.GetSigningKeyPairError(error);
    }
  }

  public setKeyPair({ keyPair }: { keyPair: SigningKeyPair }): void {
    try {
      if (!keyPair) throw new Error('No key pair found.');
      if (!keyPair.publicKey) throw new Error('No public key found.');
      if (!keyPair.secretKey) throw new Error('No secret key found.');
      this._publicKey = keyPair.publicKey as SigningPublicKey;
      this._secretKey = keyPair.secretKey as SigningSecretKey;
    } catch (error) {
      throw SignerErrors.SetSigningKeyPairError(error);
    }
  }

  public abstract generateKeyPair(params?: Record<string, any>): Promise<SigningKeyPair>;
  public abstract sign(params?: Record<string, any>): Promise<Signature>;
  public abstract verify(params?: Record<string, any>): Promise<SignatureVerified>;

  public abstract seal(params?: Record<string, any>): Promise<Signature>;
  public abstract open(params?: Record<string, any>): Promise<SignatureData>;
}