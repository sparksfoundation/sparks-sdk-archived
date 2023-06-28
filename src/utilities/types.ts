
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type CombinedInterface<T extends Record<string, any>> = {
  [K in keyof T]: T[K];
};

export interface Constructable<T> {
  new(...args: any[]): T;
}