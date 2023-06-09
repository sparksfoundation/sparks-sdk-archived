import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { parseJSON } from "../utils/index.js";

const Ed25519 = Base => class Ed25519 extends Base {

  constructor(...args) {
    super(...args);
  }

  /**
   * Signs data using ed25519
   * @param {object|string} data
   * @param {boolean} detached
   * @returns {string}
   */
  sign({ data, detached = false }: { data: object | string; detached?: boolean }) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    const uintData = util.decodeUTF8(data as string);
    const uintSecretKey = util.decodeBase64(this.keyPairs.signing.secretKey);
    const signature = detached
      ? util.encodeBase64(nacl.sign.detached(uintData, uintSecretKey))
      : util.encodeBase64(nacl.sign(uintData, uintSecretKey));

    return signature;
  }

  /**
   * Verifies data using ed25519
   * @param {string} publicKey
   * @param {string} signature
   * @param {object|string} data
   * @returns {boolean|object|string}
   */
  verify({ publicKey, signature, data }: { publicKey: string, signature: string, data: object | string }) {
    if (!publicKey || !signature) throw new Error('publicKey and signature are required')

    if (data) {
      if (typeof data !== 'string' && !(data instanceof Uint8Array)) {
        data = parseJSON(data) as string;
      }
      data = util.decodeUTF8(data as string) as Uint8Array;
    }

    const uintSignature = util.decodeBase64(signature);
    const uintPublicKey = util.decodeBase64(publicKey);

    if (data) {
      return nacl.sign.detached.verify(data as Uint8Array, uintSignature, uintPublicKey)
    } else {
      const uintResult = nacl.sign.open(uintSignature, uintPublicKey);
      if (uintResult === null) return uintResult;
      const utf8Result = util.encodeUTF8(uintResult);
      return parseJSON(utf8Result) || utf8Result;
    }
  }
}

Ed25519.type = 'sign';

Ed25519.dependencies = {
  derive: true,
}

export default Ed25519;