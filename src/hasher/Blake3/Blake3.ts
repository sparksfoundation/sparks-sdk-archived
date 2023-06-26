import util from "tweetnacl-util";
import { ErrorInterface } from "../../common/errors";
import HasherErrorFactory from "../errorFactory";
import { HashData, HashDigest, HasherType } from "../types";
import { HasherAbstract } from "../HasherCore";
import { blake3 } from "@noble/hashes/blake3";

const errors = new HasherErrorFactory(HasherType.BLAKE_3_HASHER);

export class Blake3 extends HasherAbstract {
  public async hash({ data }: { data: HashData }): ReturnType<HasherAbstract['hash']> {
    try {
      const stringData = typeof data !== 'string' ? JSON.stringify(data) : data;
      const digest = util.encodeBase64(blake3(stringData));
      return digest as HashDigest;
    } catch (error) {
      return errors.HashingFailure(error.message) as ErrorInterface;
    }
  }
}