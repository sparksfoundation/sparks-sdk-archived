import util from "tweetnacl-util";
import { blake3 } from '@noble/hashes/blake3';
import { IBlake3 } from "./types";
import { AHasher } from "../Hasher";

export class Blake3 extends AHasher implements IBlake3 {
  async hash(data) {
    const stringData = typeof data !== 'string' ? JSON.stringify(data) : data;
    return util.encodeBase64(blake3(stringData));
  }
}