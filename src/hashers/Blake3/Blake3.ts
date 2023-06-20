import util from "tweetnacl-util";
import { Hasher } from "../Hasher";
import { blake3 } from '@noble/hashes/blake3';

export class Blake3 extends Hasher {
  async hash(data) {
    const stringData = typeof data !== 'string' ? JSON.stringify(data) : data;
    return util.encodeBase64(blake3(stringData));
  }
}