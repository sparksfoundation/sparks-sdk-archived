import { SignerErrors } from "../../errors/signers";
import { Signature, SignatureData, SignatureVerified, SignerKeyPair, SignerPublicKey, SignerSecretKey, SparkSignerInterface } from "./types";

export abstract class SparkSigner implements SparkSignerInterface {
  protected _publicKey: SignerPublicKey;
  protected _secretKey: SignerSecretKey;

  constructor() {
    this.setKeyPair = this.setKeyPair.bind(this);
    this.generateKeyPair = this.generateKeyPair.bind(this);
    this.sign = this.sign.bind(this);
    this.verify = this.verify.bind(this);
    this.seal = this.seal.bind(this);
    this.open = this.open.bind(this);
  }

  public get publicKey(): SignerPublicKey {
    return this._publicKey;
  }

  public get secretKey(): SignerSecretKey {
    return this._secretKey;
  }

  public get keyPair(): SignerKeyPair {
    return {
      publicKey: this.publicKey,
      secretKey: this.secretKey,
    }
  }

  public async import(data: Record<string, any>): Promise<void> {
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({});
  }

  public setKeyPair({ publicKey, secretKey }: SignerKeyPair): void {
    try {
      if (!publicKey) throw SignerErrors.SIGNER_PUBLICKEY_ERROR();
      if (!secretKey) throw SignerErrors.SIGNER_SECRETKEY_ERROR();
      this._publicKey = publicKey as SignerPublicKey;
      this._secretKey = secretKey as SignerSecretKey;
    } catch (error: any) {
      if (error instanceof Error) throw error;
      throw SignerErrors.SIGNER_UNEXPECTED_ERROR({
        message: `Failed to set key pair. ${error?.message || ''}`,
      });
    }
  }

  public abstract generateKeyPair(params?: Record<string, any>): Promise<SignerKeyPair>;
  public abstract sign(params?: Record<string, any>): Promise<Signature>;
  public abstract verify(params?: Record<string, any>): Promise<SignatureVerified>;

  public abstract seal(params?: Record<string, any>): Promise<Signature>;
  public abstract open(params?: Record<string, any>): Promise<SignatureData>;
}