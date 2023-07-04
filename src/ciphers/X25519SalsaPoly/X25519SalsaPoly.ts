import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { parseJSON } from "../../utilities";
import { DecryptedData, EncryptedData, CipherKeyPair, CipherPublicKey, EncryptionSecret, EncryptionSharedKey } from "../types";
import { CoreCipher } from "../CoreCipher";
import { CipherErrors } from "../../errors/cipher";

export class X25519SalsaPoly extends CoreCipher {
  public async import(data: Record<string, any>): Promise<void> {
    await super.import(data);
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    return Promise.resolve(data);
  }
  
  public async generateKeyPair(params?: { secretKey?: EncryptionSecret }): ReturnType<CoreCipher['generateKeyPair']> {
    try {
      const keyPair = params?.secretKey ? nacl.box.keyPair.fromSecretKey(util.decodeBase64(params?.secretKey)) : nacl.box.keyPair();
      const publicKey = util.encodeBase64(keyPair.publicKey);
      const secretKey = util.encodeBase64(keyPair.secretKey);
      if (!publicKey || !secretKey) throw new Error('keyPair');
      return Promise.resolve({ publicKey, secretKey } as CipherKeyPair);
    } catch (error) {
      return Promise.reject(CipherErrors.GetEncryptionKeypairError(error));
    }
  }

  public async generateSharedKey({ publicKey }: { publicKey: CipherPublicKey }): ReturnType<CoreCipher['generateSharedKey']> {
    try {
      const baseCipherPublicKey = util.decodeBase64(publicKey);
      const baseCipherSecretKey = util.decodeBase64(this._secretKey);
      const uintSharedKey = nacl.box.before(baseCipherPublicKey, baseCipherSecretKey);
      const baseSharedKey = util.encodeBase64(uintSharedKey);
      if (!baseSharedKey) throw new Error();
      return Promise.resolve(baseSharedKey as EncryptionSharedKey);
    } catch (error) {
      return Promise.reject(CipherErrors.GenerateEncryptionSharedKeyError(error));
    }
  }

  public async encrypt({ data, publicKey, sharedKey }: { data: DecryptedData, publicKey?: CipherPublicKey, sharedKey?: EncryptionSharedKey }): ReturnType<CoreCipher['encrypt']> {
    try {
      let box;
      const utfData = typeof data === 'string' ? data : JSON.stringify(data);
      const uintData = util.decodeUTF8(utfData);
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      
      switch (true) {
        case publicKey !== undefined:
          const publicKeyUint = util.decodeBase64(publicKey);
          box = nacl.box(uintData, nonce, publicKeyUint, util.decodeBase64(this._secretKey));
          break;
        case sharedKey !== undefined:
          const sharedKeyUint = util.decodeBase64(sharedKey);
          box = nacl.box.after(uintData, nonce, sharedKeyUint);
          break;
        default:
          const secreKeyUint = util.decodeBase64(this._secretKey);
          box = nacl.secretbox(uintData, nonce, secreKeyUint);
          break;
      }

      const encrypted = new Uint8Array(nonce.length + box.length);
      encrypted.set(nonce);
      encrypted.set(box, nonce.length);
      const ciphertext = util.encodeBase64(encrypted);
      if (!ciphertext) throw new Error('faild to encrypt')
      return Promise.resolve(ciphertext as EncryptedData);
    } catch (error) {
      return Promise.reject(CipherErrors.EncryptError(error));
    }
  }

  public async decrypt({ data, publicKey, sharedKey }: { data: EncryptedData, publicKey?: CipherPublicKey, sharedKey?: EncryptionSharedKey }): ReturnType<CoreCipher['decrypt']> {
    try {
      const uintDataAndNonce = util.decodeBase64(data);
      const nonce = uintDataAndNonce.slice(0, nacl.secretbox.nonceLength);
      const uintData = uintDataAndNonce.slice(nacl.secretbox.nonceLength, uintDataAndNonce.length);
      let decrypted;
      switch (true) {
        case publicKey !== undefined:
          const publicKeyUint = util.decodeBase64(publicKey);
          decrypted = nacl.box.open(uintData, nonce, publicKeyUint, util.decodeBase64(this._secretKey));
          break;
        case sharedKey !== undefined:
          const sharedKeyUint = util.decodeBase64(sharedKey);
          decrypted = nacl.box.open.after(uintData, nonce, sharedKeyUint);
          break;
        default:
          const secreKeyUint = util.decodeBase64(this._secretKey);
          decrypted = nacl.secretbox.open(uintData, nonce, secreKeyUint);
          break;
      }
  
      const utf8Result = util.encodeUTF8(decrypted);
      const parsed = parseJSON(utf8Result) || utf8Result;
      if (!parsed) throw new Error('faild to decrypt');
      return Promise.resolve(parsed as DecryptedData);
    } catch(error) {
      return Promise.reject(CipherErrors.DecryptError(error));
    }
  }
}