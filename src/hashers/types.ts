// primitives
export type HashDigest = string;
export type HashData = string | Record<string, any>;

export enum HasherType {
  CORE_HASHER = 'CORE_HASHER',
  BLAKE_3_HASHER = 'BLAKE_3_HASHER',
}