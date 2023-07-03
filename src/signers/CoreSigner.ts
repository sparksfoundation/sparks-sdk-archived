import { SignerErrors } from "../errors/signer";
import { Signature, SignatureData, SignatureVerified, SignerKeyPair, SignerPublicKey, SignerSecretKey } from "./types";

// abstract class used by classes that use Hasher
export abstract class CoreSigner {
  protected _publicKey: SignerPublicKey;
  protected _secretKey: SignerSecretKey;

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

  public async import(data: Record<string, any>): Promise<void> {
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({});
  }

  public getPublicKey(): SignerPublicKey {
    try {
      if (!this._publicKey) throw new Error('No public key found.');
      return this._publicKey as SignerPublicKey;
    } catch (error) {
      throw SignerErrors.GetSignerPublicKeyError(error);
    }
  }

  public getSecretKey(): SignerSecretKey {
    try {
      if (!this._secretKey) throw new Error('No secret key found.');
      return this._secretKey as SignerSecretKey;
    } catch (error) {
      throw SignerErrors.GetSignerSecretKeyError(error);
    }
  }

  public getKeyPair(): SignerKeyPair {
    try {
      const publicKey = this.getPublicKey() as SignerPublicKey;
      if (!publicKey) throw new Error('No public key found.');
  
      const secretKey = this.getSecretKey() as SignerSecretKey;
      if (!secretKey) throw new Error('No secret key found.');
  
      return { publicKey, secretKey } as SignerKeyPair;
    } catch(error) {
      throw SignerErrors.GetSignerKeyPairError(error);
    }
  }

  public setKeyPair({ publicKey, secretKey }: SignerKeyPair): void {
    try {
      if (!publicKey) throw new Error('No public key found.');
      if (!secretKey) throw new Error('No secret key found.');
      this._publicKey = publicKey as SignerPublicKey;
      this._secretKey = secretKey as SignerSecretKey;
    } catch (error) {
      throw SignerErrors.SetSignerKeyPairError(error);
    }
  }

  public abstract generateKeyPair(params?: Record<string, any>): Promise<SignerKeyPair>;
  public abstract sign(params?: Record<string, any>): Promise<Signature>;
  public abstract verify(params?: Record<string, any>): Promise<SignatureVerified>;

  public abstract seal(params?: Record<string, any>): Promise<Signature>;
  public abstract open(params?: Record<string, any>): Promise<SignatureData>;
}