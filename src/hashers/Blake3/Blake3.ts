import util from "tweetnacl-util";
import { HashData, HashDigest } from "../types";
import { CoreHasher } from "../CoreHasher";
import { blake3 } from "@noble/hashes/blake3";
import { HasherErrors } from "../../errors/hasher";

export class Blake3 extends CoreHasher {
  public async import(data: Record<string, any>): Promise<void> {
    await super.import(data);
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    return Promise.resolve(data);
  }

  public async hash({ data }: { data: HashData }): ReturnType<CoreHasher['hash']> {
    try {
      const stringData = typeof data !== 'string' ? JSON.stringify(data) : data;
      const digest = util.encodeBase64(blake3(stringData));
      return digest as HashDigest;
    } catch (error) {
      return Promise.reject(HasherErrors.HashingFailure(error));
    }
  }
}