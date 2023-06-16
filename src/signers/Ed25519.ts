import util from "tweetnacl-util";
import { Signer } from "./Signer.js";
import nacl from "tweetnacl";

function parseJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export class Ed25519 extends Signer {
  async sign({ data, detached = false }) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    const uintData = util.decodeUTF8(data as string);
    const uintSecretKey = util.decodeBase64(this.spark.signingKeys().secretKey);
    const signature = detached
      ? util.encodeBase64(nacl.sign.detached(uintData, uintSecretKey))
      : util.encodeBase64(nacl.sign(uintData, uintSecretKey));

    return signature;
  }

  async verify({ publicKey, signature, data }) {
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
