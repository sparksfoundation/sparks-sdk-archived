import { DecryptedData, EncryptedData, CipherPublicKey, EncryptionSecret, EncryptionSharedKey } from "../types";
import { CoreCipher } from "../CoreCipher";
export declare class X25519SalsaPoly extends CoreCipher {
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    generateKeyPair(params?: {
        secretKey?: EncryptionSecret;
    }): ReturnType<CoreCipher['generateKeyPair']>;
    generateSharedKey({ publicKey }: {
        publicKey: CipherPublicKey;
    }): ReturnType<CoreCipher['generateSharedKey']>;
    encrypt({ data, publicKey, sharedKey }: {
        data: DecryptedData;
        publicKey?: CipherPublicKey;
        sharedKey?: EncryptionSharedKey;
    }): ReturnType<CoreCipher['encrypt']>;
    decrypt({ data, publicKey, sharedKey }: {
        data: EncryptedData;
        publicKey?: CipherPublicKey;
        sharedKey?: EncryptionSharedKey;
    }): ReturnType<CoreCipher['decrypt']>;
}
