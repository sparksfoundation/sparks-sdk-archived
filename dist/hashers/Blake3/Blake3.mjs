import util from "tweetnacl-util";
import { blake3 } from "@noble/hashes/blake3";
import { AHasher } from "../Hasher/index.mjs";
export class Blake3 extends AHasher {
  async hash(data) {
    const stringData = typeof data !== "string" ? JSON.stringify(data) : data;
    return util.encodeBase64(blake3(stringData));
  }
}
