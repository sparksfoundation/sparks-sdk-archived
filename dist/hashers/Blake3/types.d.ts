export interface IBlake3 {
    hash(data: string): Promise<string>;
}
