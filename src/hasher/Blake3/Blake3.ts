import util from "tweetnacl-util";
import { HashData, HashDigest } from "../types";
import { HasherCore } from "../HasherCore";
import { blake3 } from "@noble/hashes/blake3";
import { HasherErrors } from "../../error/hasher";

export class Blake3 extends HasherCore {
  public async hash({ data }: { data: HashData }): ReturnType<HasherCore['hash']> {
    try {
      const stringData = typeof data !== 'string' ? JSON.stringify(data) : data;
      const digest = util.encodeBase64(blake3(stringData));
      return digest as HashDigest;
    } catch (error) {
      return Promise.reject(HasherErrors.HashingFailure(error));
    }
  }
}