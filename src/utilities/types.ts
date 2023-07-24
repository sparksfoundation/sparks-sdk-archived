
export type Constructable<T> = new (...args: any[]) => T;

export type Instance<T> = T extends Constructable<infer U> ? U : never;

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
: Lowercase<S>