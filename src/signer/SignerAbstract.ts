import { ErrorInterface } from "../common/errors";
import { Signature, SignatureData, SignatureVerified, SignerType, SigningKeyPair, SigningPublicKey, SigningSecretKey } from "./types";
import { SignerErrorFactory } from "./errorFactory";

const errors = new SignerErrorFactory(SignerType.CORE_SIGNER);

// abstract class used by classes that use Hasher
export abstract class SignerAbstract {
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

  public getPublicKey(): SigningPublicKey | ErrorInterface {
    if (!this._publicKey) return errors.InvalidPublicKey() as ErrorInterface;
    return this._publicKey as SigningPublicKey;
  }

  public getSecretKey(): SigningSecretKey | ErrorInterface {
    if (!this._secretKey) return errors.InvalidSecretKey() as ErrorInterface;
    return this._secretKey as SigningSecretKey;
  }

  public getKeyPair(): SigningKeyPair | ErrorInterface {
    const publicKey = this.getPublicKey() as SigningPublicKey;
    if (!publicKey) return errors.InvalidPublicKey() as ErrorInterface;

    const secretKey = this.getSecretKey() as SigningSecretKey;
    if (!secretKey) return errors.InvalidSecretKey() as ErrorInterface;

    return { publicKey, secretKey } as SigningKeyPair;
  }

  public setKeyPair({ keyPair }: { keyPair: SigningKeyPair }): void | ErrorInterface {
    if (!keyPair) return errors.InvalidKeyPair() as ErrorInterface;
    if (!keyPair.publicKey) return errors.InvalidPublicKey() as ErrorInterface;
    if (!keyPair.secretKey) return errors.InvalidSecretKey() as ErrorInterface;
    this._publicKey = keyPair.publicKey as SigningPublicKey;
    this._secretKey = keyPair.secretKey as SigningSecretKey;
  }

  public abstract generateKeyPair(params?: Record<string, any>): Promise<SigningKeyPair | ErrorInterface>;
  public abstract sign(params?: Record<string, any>): Promise<Signature | ErrorInterface>;
  public abstract verify(params?: Record<string, any>): Promise<SignatureVerified | ErrorInterface>;

  public abstract seal(params?: Record<string, any>): Promise<Signature | ErrorInterface>;
  public abstract open(params?: Record<string, any>): Promise<SignatureData | ErrorInterface>;
}