import { IHasher } from "./types";

export class Hasher implements IHasher {
  async hash(data) {
    return data;
  }
}