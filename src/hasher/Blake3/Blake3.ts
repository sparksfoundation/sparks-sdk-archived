import util from "tweetnacl-util";
import { ErrorInterface } from "../../common/errors";
import HasherErrorFactory from "../errorFactory";
import { HashData, HashDigest, HasherAbstract, HasherType } from "../types";
import { blake3 } from "@noble/hashes/blake3";

const errors = new HasherErrorFactory(HasherType.BLAKE_3);

export class Blake3 extends HasherAbstract {
  public async hash(data: HashData): ReturnType<HasherAbstract['hash']> {
    try {
      const stringData = typeof data !== 'string' ? JSON.stringify(data) : data;
      const digest = util.encodeBase64(blake3(stringData));
      return digest as HashDigest;
    } catch (error) {
      return errors.HashingFailure(error.message) as ErrorInterface;
    }
  }
}