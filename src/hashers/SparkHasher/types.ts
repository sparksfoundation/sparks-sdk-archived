export type HashDigest = string;
export type HashData = string | Record<string, any>;

export enum HasherType {
  CORE_HASHER = 'CORE_HASHER',
  BLAKE_3_HASHER = 'BLAKE_3_HASHER',
}

export interface SparkHasherInterface {
  import(data: Record<string, any>): Promise<void>;
  export(): Promise<Record<string, any>>;

  hash(params?: Record<string, any>): HashDigest;
}