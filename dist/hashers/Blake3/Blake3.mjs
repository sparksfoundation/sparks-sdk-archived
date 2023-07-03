import util from "tweetnacl-util";
import { CoreHasher } from "../CoreHasher.mjs";
import { blake3 } from "@noble/hashes/blake3";
import { HasherErrors } from "../../errors/hasher.mjs";
export class Blake3 extends CoreHasher {
  async import(data) {
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    return Promise.resolve(data);
  }
  async hash({ data }) {
    try {
      const stringData = typeof data !== "string" ? JSON.stringify(data) : data;
      const digest = util.encodeBase64(blake3(stringData));
      return digest;
    } catch (error) {
      return Promise.reject(HasherErrors.HashingFailure(error));
    }
  }
}
