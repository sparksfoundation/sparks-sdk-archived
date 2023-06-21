export interface IEd25519 {
    sign(data: string): Promise<string>;
    verify(data: string, signature: string): Promise<boolean>;
}
