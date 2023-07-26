import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { parseJSON } from "../../utilities";
import { DecryptedData, EncryptedData, CipherKeyPair, CipherPublicKey, EncryptionSecret, EncryptionSharedKey } from '../SparkCipher/types';
import { SparkCipher } from "../SparkCipher";
import { SparkErrors } from "../../errors";
import { CipherErrors } from "../../errors/ciphers";
import { SparkEvent } from "../../events/SparkEvent";

export class X25519SalsaPoly extends SparkCipher {
  constructor() {
    super({
      algorithm: 'x25519-salsa20-poly1305',
    });
  }

  public async import(data: Record<string, any>): Promise<void> {
    await super.import(data);
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    const data = await super.export() || {};
    return Promise.resolve(data);
  }

  public async generateKeyPair(params?: { secretKey?: EncryptionSecret }): ReturnType<SparkCipher['generateKeyPair']> {
    try {
      const keyPair = params?.secretKey ? nacl.box.keyPair.fromSecretKey(util.decodeBase64(params?.secretKey)) : nacl.box.keyPair();
      if (!keyPair) throw CipherErrors.CIPHER_KEYPAIR_ERROR();
      const publicKey = util.encodeBase64(keyPair.publicKey);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey) throw CipherErrors.CIPHER_KEYPAIR_ERROR();
      return Promise.resolve({ publicKey, secretKey } as CipherKeyPair);
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(CipherErrors.CIPHER_UNEXPECTED_ERROR({
        message: `Failed to generate key pair. ${error?.message || ''}`,
      }));
    }
  }

  public async generateSharedKey({ publicKey }: { publicKey: CipherPublicKey }): ReturnType<SparkCipher['generateSharedKey']> {
    try {
      const baseCipherPublicKey = util.decodeBase64(publicKey);
      const baseCipherSecretKey = util.decodeBase64(this.secretKey);
      const uintSharedKey = nacl.box.before(baseCipherPublicKey, baseCipherSecretKey);
      const baseSharedKey = util.encodeBase64(uintSharedKey);
      if (!baseSharedKey) throw CipherErrors.CIPHER_KEYPAIR_ERROR();
      return Promise.resolve(baseSharedKey as EncryptionSharedKey);
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(CipherErrors.CIPHER_UNEXPECTED_ERROR({
        message: `Failed to generate shared key. ${error?.message || ''}`,
      }));
    }
  }

  public async encrypt({ data, publicKey, sharedKey }: { data: DecryptedData, publicKey?: CipherPublicKey, sharedKey?: EncryptionSharedKey }): ReturnType<SparkCipher['encrypt']> {
    try {
      let box;
      const utfData = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(utfData);
      const nonce = nacl.randomBytes(nacl.box.nonceLength);

      if (typeof publicKey === 'string') {
        const publicKeyUint = util.decodeBase64(publicKey);
        box = nacl.box(uintData, nonce, publicKeyUint, util.decodeBase64(this.secretKey));
      } else if (typeof sharedKey === 'string') {
        const sharedKeyUint = util.decodeBase64(sharedKey);
        box = nacl.box.after(uintData, nonce, sharedKeyUint);
      } else {
        const secreKeyUint = util.decodeBase64(this.secretKey);
        box = nacl.secretbox(uintData, nonce, secreKeyUint);
      }

      const encrypted = new Uint8Array(nonce.length + box.length);
      if (!encrypted) throw CipherErrors.CIPHER_ENCRYPTION_ERROR();

      encrypted.set(nonce);
      encrypted.set(box, nonce.length);
      const ciphertext = util.encodeBase64(encrypted);
      if (!ciphertext) throw CipherErrors.CIPHER_ENCRYPTION_ERROR();
      return Promise.resolve(ciphertext as EncryptedData);
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(CipherErrors.CIPHER_UNEXPECTED_ERROR({
        message: `Failed to encrypt data. ${error?.message || ''}`,
      }));
    }
  }

  public async decrypt({ data, publicKey, sharedKey }: { data: EncryptedData, publicKey?: CipherPublicKey, sharedKey?: EncryptionSharedKey }): ReturnType<SparkCipher['decrypt']> {
    try {
      const uintDataAndNonce = util.decodeBase64(data);
      const nonce = uintDataAndNonce.slice(0, nacl.secretbox.nonceLength);
      const uintData = uintDataAndNonce.slice(nacl.secretbox.nonceLength, uintDataAndNonce.length);

      let decrypted;
      if (typeof publicKey === 'string') {
        const publicKeyUint = util.decodeBase64(publicKey);
        decrypted = nacl.box.open(uintData, nonce, publicKeyUint, util.decodeBase64(this.secretKey));
      } else if (typeof sharedKey === 'string') {
        const sharedKeyUint = util.decodeBase64(sharedKey);
        decrypted = nacl.box.open.after(uintData, nonce, sharedKeyUint);
      } else {
        const secreKeyUint = util.decodeBase64(this.secretKey);
        decrypted = nacl.secretbox.open(uintData, nonce, secreKeyUint);
      }

      if (!(decrypted instanceof Uint8Array)) {
        throw CipherErrors.CIPHER_DECRYPTION_ERROR();
      }

      const utf8Result = util.encodeUTF8(decrypted);
      const parsed = parseJSON(utf8Result) || utf8Result;
      if (!parsed || !utf8Result) throw CipherErrors.CIPHER_DECRYPTION_ERROR();
      return Promise.resolve(parsed as DecryptedData);
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(CipherErrors.CIPHER_UNEXPECTED_ERROR({
        message: `Failed to decrypt data. ${error?.message || ''}`,
      }));
    }
  }
}