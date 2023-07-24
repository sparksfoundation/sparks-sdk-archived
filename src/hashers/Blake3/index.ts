import util from "tweetnacl-util";
import { HashData, HashDigest } from "../SparkHasher/types";
import { blake3 } from "@noble/hashes/blake3";
import { SparkHasher } from "../SparkHasher";
import { HasherErrors } from "../../errors/hashers";
import { SparkEvent } from "../../events/SparkEvent";

export class Blake3 extends SparkHasher {
  public async import(data: Record<string, any>): Promise<void> {
    await super.import(data);
    return Promise.resolve();
  }
  
  public async export(): Promise<Record<string, any>> {
    const data = await super.export();
    return Promise.resolve(data);
  }

  public async hash({ data }: { data: HashData }): ReturnType<SparkHasher['hash']> {
    try {
      const stringData = typeof data !== 'string' ? JSON.stringify(data) : data;
      const hashedString = blake3(stringData);
      const b64DHash = util.encodeBase64(hashedString);
      if (!b64DHash) throw HasherErrors.HASING_ERROR();
      return b64DHash as HashDigest;
    } catch (error: any) {
      if (error instanceof SparkEvent) return Promise.reject(error);
      return Promise.reject(HasherErrors.HASHER_UNEXPECTED_ERROR({
        message: `Failed to hash data. ${error?.message || ''}`,
      }));
    }
  }
}