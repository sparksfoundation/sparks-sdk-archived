import { ErrorMessage, SparkError } from "../common/errors";
import { CipherErrorType, CipherType } from "./types";

export class CipherErrorFactory {
  private cipher: CipherType;
  constructor(cipher) {
      this.cipher = cipher;
  }

  public InvalidPublicKey() {
      return new SparkError({
          type: CipherErrorType.INVALID_PUBLIC_ENCRYPTION_KEY,
          message: 'invalid public encryption key',
          metadata: { cipher: this.cipher }
      });
  }

  public InvalidSecretKey() {
      return new SparkError({
          type: CipherErrorType.INVALID_SECRET_ENCRYPTION_KEY,
          message: 'invalid secret encryption key',
          metadata: { cipher: this.cipher }
      });
  }

  public InvalidKeyPair() {
      return new SparkError({
          type: CipherErrorType.INVALID_ENCRYPTION_KEYPAIR,
          message: `invalid encryption key pair`,
          metadata: { cipher: this.cipher }
      });
  }

  public KeyPairFailure(reason?: ErrorMessage) {
      return new SparkError({
          type: CipherErrorType.GENERATE_ENCRYPTION_KEYPAIR_ERROR,
          message: `failed to generate encryption key pair${reason ? `: ${reason}` : ''}`,
          metadata: { cipher: this.cipher }
      });
  }

  public SharedKeyFailure(reason?: ErrorMessage) {
      return new SparkError({
          type: CipherErrorType.GENERATE_SHARED_ENCRYPTION_KEY_ERROR,
          message: `failed to generate shared encryption key${reason ? `: ${reason}` : ''}`,
          metadata: { cipher: this.cipher }
      });
  }

  public EncryptionFailure(reason?: ErrorMessage) {
      return new SparkError({
          type: CipherErrorType.ENCRYPTION_FAILURE,
          message: `failed to encrypt data${reason ? `: ${reason}` : ''}`,
          metadata: { cipher: this.cipher }
      });
  }

  public DecryptionFailure(reason?: ErrorMessage) {
      return new SparkError({
          type: CipherErrorType.DECRYPTION_FAILURE,
          message: `failed to decrypt data${reason ? `: ${reason}` : ''}`,
          metadata: { cipher: this.cipher }
      });
  }
}


