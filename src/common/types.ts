export type CommonProperties<T> = T extends (infer U)[] ? keyof U : never;

export type CombinedInterface<T extends object[]> = Pick<T[number], CommonProperties<T>>;
