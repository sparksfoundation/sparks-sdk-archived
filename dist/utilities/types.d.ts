export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export interface Constructable<T> {
    new (...args: any[]): T;
}
