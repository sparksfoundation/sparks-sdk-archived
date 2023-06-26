// primitives
export type HashDigest = string;
export type HashData = string | Record<string, any>;

export enum HasherErrorType {
  HASHING_ERROR = 'HASHING_ERROR',
}

export enum HasherType {
  HASHER_CORE = 'HASHER_CORE',
  BLAKE_3_HASHER = 'BLAKE_3_HASHER',
}